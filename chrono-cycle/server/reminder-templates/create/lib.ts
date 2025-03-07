import { eq, and } from "drizzle-orm";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";

import { CreateError, CreateFormData, CreateResult } from "./data";

import getFuncDb, { FunctionalDatabase } from "@/server/db/functional";
import {
    DbReminderTemplate,
    eventTemplates,
    projectTemplates,
    reminderTemplates,
    users,
} from "@/server/db/schema";
import {
    decodeEventTemplateId,
    encodeReminderTemplateId,
} from "@/server/common/identifiers";
import { DoesNotExistError, InternalError } from "@/server/common/errors";
import { ReminderTemplate } from "@/server/common/data";

function checkOwnershipTask(
    fDb: FunctionalDatabase,
    userId: number,
    eventTemplateSqid: string,
): TE.TaskEither<CreateError, void> {
    return pipe(
        fDb.do((db) =>
            db
                .select()
                .from(users)
                .innerJoin(
                    projectTemplates,
                    eq(users.id, projectTemplates.userId),
                )
                .innerJoin(
                    eventTemplates,
                    eq(projectTemplates.id, eventTemplates.id),
                )
                .where(
                    and(
                        eq(users.id, userId),
                        eq(
                            eventTemplates.id,
                            decodeEventTemplateId(eventTemplateSqid),
                        ),
                    ),
                ),
        ),
        TE.chain((selected) => {
            if (selected.length < 1) {
                return TE.left(
                    DoesNotExistError() satisfies CreateError as CreateError,
                );
            }

            if (selected.length > 1) {
                return TE.left(
                    InternalError(
                        "Unexpected multiple matching event templates",
                    ) satisfies CreateError as CreateError,
                );
            }

            return TE.right(undefined);
        }),
    );
}

function insertReminderTemplateTask(
    fDb: FunctionalDatabase,
    data: CreateFormData,
): TE.TaskEither<CreateError, DbReminderTemplate> {
    return pipe(
        fDb.do(async (db) => {
            const { eventTemplateId: eventTemplateSqid, ...partial } = data;
            const inserted = await db
                .insert(reminderTemplates)
                .values({
                    eventTemplateId: decodeEventTemplateId(eventTemplateSqid),
                    ...partial,
                })
                .returning();
            return inserted[0];
        }),
    );
}

export async function createReminderTemplate(
    userId: number,
    data: CreateFormData,
): Promise<CreateResult> {
    const fDb = await getFuncDb();

    const task = pipe(
        // Check if the user owns the event template.
        checkOwnershipTask(fDb, userId, data.eventTemplateId),

        // Insert the reminder template.
        TE.chain(() => insertReminderTemplateTask(fDb, data)),

        // Map to domain object.
        TE.map((dbRt) => {
            const { id, eventTemplateId, ...partial } = dbRt;
            return {
                id: encodeReminderTemplateId(id),
                ...partial,
            } satisfies ReminderTemplate;
        }),
    );

    return task();
}
