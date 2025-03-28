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
import { retrieveExpandedEventTemplateById } from "./list";

function rawUpdateEventTemplate(
    db: DbLike,
    data: DbEventTemplateUpdate,
): TE.TaskEither<DoesNotExistError, DbEventTemplate> {
    return pipe(
        TE.fromTask(() =>
            db
                .update(eventTemplatesTable)
                .set({ ...data, updatedAt: new Date() })
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
        TE.Do,
        TE.bind("oldExpandedEt", () =>
            retrieveExpandedEventTemplateById(db, data.id),
        ),

        // Try updating the event template.
        TE.bindW("updatedEt", () => rawUpdateEventTemplate(db, data)),

        TE.bindW("newTags", ({ oldExpandedEt }) => {
            const newDesiredTags = data.tags;
            return newDesiredTags !== undefined
                ? pipe(
                      // Clear the current tags.
                      TE.fromTask(() => clearTags(db, data.id)),
                      // Ensure that all new tags exist.
                      TE.chain(() => ensureTagsExist(db, newDesiredTags)),
                      // Link the tags with the event template.
                      TE.tap((newTags) =>
                          TE.fromTask(() => linkTags(db, data.id, newTags)),
                      ),
                  )
                : TE.of(oldExpandedEt.tags);
        }),

        // Update existing reminders.
        TE.bindW("updatedRts", () =>
            pipe(
                data.remindersUpdate ?? [],
                TE.traverseArray((rt) => updateReminderTemplate(db, rt)),
            ),
        ),
        // Delete removed reminders.
        TE.tap(() =>
            // Raw delete since we already know the user owns the reminder templates.
            rawDeleteReminderTemplates(db, new Set(data.remindersDelete ?? [])),
        ),
        // Insert new reminders.
        TE.bindW("insertedRts", () =>
            TE.fromTask(() =>
                rawInsertReminderTemplates(
                    db,
                    data.remindersInsert?.map((reminder) => ({
                        eventTemplateId: data.id,
                        ...reminder,
                    })) ?? [],
                ),
            ),
        ),
        TE.map(({ updatedEt, newTags, updatedRts, insertedRts }) => {
            return {
                ...updatedEt,
                reminders: updatedRts.concat(insertedRts),
                tags: newTags,
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
