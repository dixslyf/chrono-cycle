import { pipe } from "fp-ts/function";
import { type NonEmptyArray } from "fp-ts/NonEmptyArray";
import * as TE from "fp-ts/TaskEither";

import { AssertionError, DoesNotExistError } from "@/common/errors";

import { DbLike } from "@/db";
import { checkUserOwnsEventTemplates } from "@/db/queries/event-templates/checkOwnership";
import {
    DbReminderTemplate,
    DbReminderTemplateInsert,
    reminderTemplates,
} from "@/db/schema";

export async function rawInsertReminderTemplates(
    db: DbLike,
    rts: DbReminderTemplateInsert[],
): Promise<DbReminderTemplate[]> {
    if (rts.length === 0) {
        return [];
    }
    return await db.insert(reminderTemplates).values(rts).returning();
}

export function createReminderTemplates(
    db: DbLike,
    userId: number,
    rts: DbReminderTemplateInsert[],
): TE.TaskEither<DoesNotExistError | AssertionError, DbReminderTemplate[]> {
    if (rts.length === 0) {
        return TE.right([]);
    }

    // Safety: Guaranteed to have at least one value since we did the check above.
    rts = rts as NonEmptyArray<DbReminderTemplateInsert>;
    return pipe(
        // Check if the user owns the event templates.
        checkUserOwnsEventTemplates(
            db,
            userId,
            new Set(rts.map((rt) => rt.eventTemplateId)),
        ),

        // Insert the reminder templates.
        TE.chain(() => TE.fromTask(() => rawInsertReminderTemplates(db, rts))),
    );
}
