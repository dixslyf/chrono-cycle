import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { AssertionError, DoesNotExistError } from "@/common/errors";

import { DbLike } from "@/db";
import { checkProjectTemplateExists } from "@/db/queries/project-templates/checkExists";
import { rawInsertReminderTemplates } from "@/db/queries/reminder-templates/create";
import { ensureTagsExist } from "@/db/queries/tags/create";
import { wrapWithTransaction } from "@/db/queries/utils/transaction";
import {
    DbEventTemplate,
    DbEventTemplateInsert,
    DbExpandedEventTemplate,
    DbExpandedEventTemplateInsert,
    eventTemplates as eventTemplatesTable,
} from "@/db/schema";

import { linkTags } from "./linkTags";

// Task to insert the event template.
async function rawInsertEventTemplate(
    db: DbLike,
    toInsert: DbEventTemplateInsert,
): Promise<DbEventTemplate> {
    return (
        await db.insert(eventTemplatesTable).values(toInsert).returning()
    )[0];
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
        TE.bind("tags", () => ensureTagsExist(db, data.tags)),
        // Link the tags with the event template.
        TE.tap(({ id, tags }) => TE.fromTask(() => linkTags(db, id, tags))),
        // Insert the reminders.
        TE.bind("reminders", ({ id: eventTemplateId }) =>
            TE.fromTask(() =>
                rawInsertReminderTemplates(
                    db,
                    data.reminders.map((reminder) => ({
                        eventTemplateId,
                        ...reminder,
                    })),
                ),
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
