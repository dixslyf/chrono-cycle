import { eq, and, or } from "drizzle-orm";
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import { NonEmptyArray } from "fp-ts/NonEmptyArray";
import { pipe } from "fp-ts/function";

import { CreateError, ReminderTemplateCreate, CreateResult } from "./data";

import {
    eventTemplates,
    projectTemplates,
    reminderTemplates,
    users,
} from "@/server/db/schema";
import getDb, { DbLike } from "@/server/db";
import {
    decodeEventTemplateId,
    encodeReminderTemplateId,
} from "@/server/common/identifiers";
import { DoesNotExistError, InternalError } from "@/server/common/errors";
import { ReminderTemplate } from "@/server/common/data";

// Checks that the user owns the event templates.
export async function checkUserOwnsEventTemplates(
    db: DbLike,
    userId: number,
    etIds: NonEmptyArray<string>,
): Promise<E.Either<CreateError, void>> {
    const uniqueEtIds = Array.from(new Set(etIds));

    const conditions = uniqueEtIds.map((etId) =>
        and(
            eq(users.id, userId),
            eq(eventTemplates.id, decodeEventTemplateId(etId)),
        ),
    );

    const rows = await db
        .select()
        .from(users)
        .innerJoin(projectTemplates, eq(users.id, projectTemplates.userId))
        .innerJoin(eventTemplates, eq(projectTemplates.id, eventTemplates.id))
        .where(or(...conditions));

    if (rows.length < uniqueEtIds.length) {
        return E.left(DoesNotExistError() satisfies CreateError as CreateError);
    }

    if (rows.length > uniqueEtIds.length) {
        return E.left(
            InternalError(
                "Unexpected multiple matching event templates",
            ) satisfies CreateError as CreateError,
        );
    }

    return E.right(undefined);
}

export async function insertReminderTemplates(
    db: DbLike,
    rts: ReminderTemplateCreate[],
): Promise<ReminderTemplate[]> {
    if (rts.length === 0) {
        return [];
    }

    const inserted = await db
        .insert(reminderTemplates)
        .values(
            rts.map((rt) => {
                const { eventTemplateId: eventTemplateSqid, ...partial } = rt;
                return {
                    eventTemplateId: decodeEventTemplateId(eventTemplateSqid),
                    ...partial,
                };
            }),
        )
        .returning();

    return inserted.map((dbRt) => {
        const { id, eventTemplateId, ...partial } = dbRt;
        return {
            id: encodeReminderTemplateId(id),
            ...partial,
        } satisfies ReminderTemplate;
    });
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
        () =>
            checkUserOwnsEventTemplates(
                db,
                userId,
                rts.map((rt) => rt.eventTemplateId) as NonEmptyArray<string>, // Safety: `rts` is non-empty.
            ),

        // Insert the reminder templates.
        TE.chain(() => TE.fromTask(() => insertReminderTemplates(db, rts))),
    );

    return await pipe(
        TE.tryCatch(
            task,
            (_err) => InternalError() satisfies CreateError as CreateError,
        ),
        TE.chain((value) => TE.fromEither(value)), // Flatten
    )();
}
