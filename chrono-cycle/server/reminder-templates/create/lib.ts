import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import { NonEmptyArray } from "fp-ts/NonEmptyArray";
import { pipe } from "fp-ts/function";

import { ReminderTemplateCreate, CreateResult, CreateError } from "./data";

import { reminderTemplates } from "@/server/db/schema";
import getDb, { DbLike } from "@/server/db";
import {
    decodeEventTemplateId,
    encodeReminderTemplateId,
} from "@/server/common/identifiers";
import { InternalError } from "@/server/common/errors";
import { ReminderTemplate } from "@/server/common/data";
import { checkUserOwnsEventTemplates } from "@/server/common/queries";
import { serverActionLogger } from "@/server/log";

export function insertReminderTemplates(
    db: DbLike,
    rts: ReminderTemplateCreate[],
): TE.TaskEither<InternalError, ReminderTemplate[]> {
    if (rts.length === 0) {
        return TE.right([] as ReminderTemplate[]);
    }

    const task = pipe(
        TE.tryCatch(
            async () =>
                await db
                    .insert(reminderTemplates)
                    .values(
                        rts.map((rt) => {
                            const {
                                eventTemplateId: eventTemplateSqid,
                                ...partial
                            } = rt;
                            return {
                                eventTemplateId:
                                    decodeEventTemplateId(eventTemplateSqid),
                                ...partial,
                            };
                        }),
                    )
                    .returning(),
            (err) => {
                serverActionLogger.error(err);
                return InternalError();
            },
        ),
        TE.map((inserted) =>
            inserted.map((dbRt) => {
                const { id, eventTemplateId, ...partial } = dbRt;
                return {
                    id: encodeReminderTemplateId(id),
                    ...partial,
                } satisfies ReminderTemplate;
            }),
        ),
    );

    return task;
}

export async function createReminderTemplates(
    userId: number,
    rts: ReminderTemplateCreate[],
): Promise<CreateResult> {
    if (rts.length === 0) {
        return E.right([]);
    }

    // Safety: Guaranteed to have at least one value since we did the check above.
    rts = rts as NonEmptyArray<ReminderTemplateCreate>;

    const db = await getDb();
    const task = pipe(
        // Check if the user owns the event templates.
        checkUserOwnsEventTemplates(
            db,
            userId,
            rts.map((rt) => rt.eventTemplateId) as NonEmptyArray<string>, // Safety: `rts` is non-empty.
        ),

        // Insert the reminder templates.
        TE.chain<CreateError, void, ReminderTemplate[]>(() =>
            insertReminderTemplates(db, rts),
        ),
    );

    return task();
}
