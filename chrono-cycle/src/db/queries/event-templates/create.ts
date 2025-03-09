import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { AssertionError, DoesNotExistError } from "@common/errors";

import { DbLike } from "@db";
import { rawInsertReminderTemplates } from "@db/queries/reminder-templates/create";
import { ensureTagsExist } from "@db/queries/tags/create";
import {
    DbEventTemplate,
    DbEventTemplateInsert,
    DbEventTemplateTag,
    DbExpandedEventTemplate,
    DbExpandedEventTemplateInsert,
    DbReminder,
    DbReminderTemplate,
    DbTag,
    eventTemplates as eventTemplatesTable,
    eventTemplateTags,
} from "@db/schema";

import { checkProjectTemplateExists } from "../project-templates/checkExists";
import { wrapWithTransaction } from "../utils/transaction";

// Task to insert the event template.
async function rawInsertEventTemplate(
    db: DbLike,
    toInsert: DbEventTemplateInsert,
): Promise<DbEventTemplate> {
    return (
        await db.insert(eventTemplatesTable).values(toInsert).returning()
    )[0];
}

// Task to insert into the junction table linking tags and event templates.
async function linkTags(
    db: DbLike,
    eventTemplateId: number,
    tags: DbTag[],
): Promise<DbEventTemplateTag[]> {
    if (tags.length === 0) {
        return [];
    }

    return await db
        .insert(eventTemplateTags)
        .values(
            tags.map((tag) => ({
                eventTemplateId,
                tagId: tag.id,
            })),
        )
        .returning();
}

// Does not wrap database operations in a transaction!
function unsafeRawInsertExpandedEventTemplate(
    db: DbLike,
    data: DbExpandedEventTemplateInsert,
): TE.TaskEither<AssertionError, DbExpandedEventTemplate> {
    return pipe(
        // Try inserting the event template.
        TE.fromTask(() => rawInsertEventTemplate(db, data)),
        // Ensure that all tags exist.
        TE.chain((eventTemplate) =>
            pipe(
                ensureTagsExist(db, data.tags),
                TE.map((tags) => ({ ...eventTemplate, tags })),
            ),
        ),
        // Link the tags with the event template.
        TE.chain<
            AssertionError,
            Omit<DbExpandedEventTemplate, "reminders">,
            Omit<DbExpandedEventTemplate, "reminders">
        >((partialExpandedEt) =>
            pipe(
                TE.fromTask(() =>
                    linkTags(db, partialExpandedEt.id, partialExpandedEt.tags),
                ),
                // Ignore the return of `linkTagsTask`, just return the event template and tags.
                TE.map(() => partialExpandedEt),
            ),
        ),
        // Insert the reminders.
        TE.chain<
            AssertionError,
            Omit<DbExpandedEventTemplate, "reminders">,
            DbExpandedEventTemplate
        >((partialExpandedEt) =>
            pipe(
                TE.fromTask(() =>
                    rawInsertReminderTemplates(db, data.reminders),
                ),
                TE.map((reminders) => ({ ...partialExpandedEt, reminders })),
            ),
        ),
    );
}

export function createEventTemplate(
    db: DbLike,
    userId: number,
    data: DbExpandedEventTemplateInsert,
): TE.TaskEither<AssertionError | DoesNotExistError, DbExpandedEventTemplate> {
    return pipe(
        checkProjectTemplateExists(db, userId, data.projectTemplateId),
        TE.chainW(() =>
            wrapWithTransaction(db, (tx) =>
                unsafeRawInsertExpandedEventTemplate(tx, data),
            ),
        ),
    );
}
