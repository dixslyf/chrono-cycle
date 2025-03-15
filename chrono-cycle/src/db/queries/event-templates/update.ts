import { eq } from "drizzle-orm";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { AssertionError, DoesNotExistError } from "@/common/errors";

import { DbLike } from "@/db";
import { rawInsertReminderTemplates } from "@/db/queries/reminder-templates/create";
import { rawDeleteReminderTemplates } from "@/db/queries/reminder-templates/delete";
import { updateReminderTemplate } from "@/db/queries/reminder-templates/update";
import { ensureTagsExist } from "@/db/queries/tags/create";
import { wrapWithTransaction } from "@/db/queries/utils/transaction";
import {
    DbEventTemplate,
    DbEventTemplateUpdate,
    DbExpandedEventTemplate,
    DbExpandedEventTemplateUpdate,
    eventTemplates as eventTemplatesTable,
} from "@/db/schema";

import { checkUserOwnsEventTemplates } from "./checkOwnership";
import { clearTags } from "./clearTags";
import { linkTags } from "./linkTags";

function rawUpdateEventTemplate(
    db: DbLike,
    data: DbEventTemplateUpdate,
): TE.TaskEither<DoesNotExistError, DbEventTemplate> {
    return pipe(
        TE.fromTask(() =>
            db
                .update(eventTemplatesTable)
                .set(data)
                .where(eq(eventTemplatesTable.id, data.id))
                .returning(),
        ),
        TE.chain((updated) =>
            updated.length === 0
                ? TE.left(DoesNotExistError())
                : TE.right(updated[0]),
        ),
    );
}

// Does not wrap database operations in a transaction!
function unsafeUpdateExpandedEventTemplate(
    db: DbLike,
    data: DbExpandedEventTemplateUpdate,
): TE.TaskEither<DoesNotExistError | AssertionError, DbExpandedEventTemplate> {
    return pipe(
        // Try updating the event template.
        rawUpdateEventTemplate(db, data),

        // Clear the current tags.
        TE.tap(({ id }) => TE.fromTask(() => clearTags(db, id))),
        // Ensure that all new tags exist.
        TE.bindW("tags", () => ensureTagsExist(db, data.tags)),
        // Link the tags with the event template.
        TE.tap(({ id, tags }) => TE.fromTask(() => linkTags(db, id, tags))),

        // Update existing reminders.
        TE.bindW("updatedRts", () =>
            pipe(
                data.remindersUpdate,
                TE.traverseArray((rt) => updateReminderTemplate(db, rt)),
            ),
        ),
        // Delete removed reminders.
        TE.tap(() =>
            pipe(data.remindersDelete, (toDeleteRts) =>
                // Raw delete since we already know the user owns the reminder templates.
                rawDeleteReminderTemplates(db, new Set(toDeleteRts)),
            ),
        ),
        // Insert new reminders.
        TE.bindW("insertedRts", ({ id: eventTemplateId }) =>
            TE.fromTask(() =>
                rawInsertReminderTemplates(
                    db,
                    data.remindersInsert.map((reminder) => ({
                        eventTemplateId,
                        ...reminder,
                    })),
                ),
            ),
        ),
        TE.map((ctx) => {
            const { updatedRts, insertedRts, ...rest } = ctx;
            return {
                reminders: updatedRts.concat(insertedRts),
                ...rest,
            } satisfies DbExpandedEventTemplate;
        }),
    );
}

export function updateEventTemplate(
    db: DbLike,
    userId: number,
    data: DbExpandedEventTemplateUpdate,
): TE.TaskEither<DoesNotExistError | AssertionError, DbExpandedEventTemplate> {
    return pipe(
        checkUserOwnsEventTemplates(db, userId, new Set([data.id])),
        TE.chainW(() =>
            wrapWithTransaction(db, (tx) =>
                unsafeUpdateExpandedEventTemplate(tx, data),
            ),
        ),
    );
}
