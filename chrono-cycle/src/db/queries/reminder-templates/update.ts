import { eq } from "drizzle-orm";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { DoesNotExistError } from "@/common/errors";

import { DbLike } from "@/db";
import {
    DbReminderTemplate,
    DbReminderTemplateUpdate,
    reminderTemplates as reminderTemplatesTable,
} from "@/db/schema";

export function updateReminderTemplate(
    db: DbLike,
    data: DbReminderTemplateUpdate,
): TE.TaskEither<DoesNotExistError, DbReminderTemplate> {
    const task = pipe(
        TE.fromTask(() =>
            db
                .update(reminderTemplatesTable)
                .set(data)
                .where(eq(reminderTemplatesTable.id, data.id))
                .returning(),
        ),
        TE.chain((updated) =>
            updated.length === 0
                ? TE.left(DoesNotExistError())
                : TE.right(updated[0]),
        ),
    );

    return task;
}
