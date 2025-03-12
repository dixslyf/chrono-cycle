import { and, eq, or } from "drizzle-orm";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { AssertionError, DoesNotExistError } from "@/common/errors";

import { DbLike } from "@/db/index";
import {
    eventTemplates as eventTemplatesTable,
    projectTemplates as projectTemplatesTable,
    reminderTemplates as reminderTemplatesTable,
    users as usersTable,
} from "@/db/schema";

// Checks that the user owns the reminder templates.
export function checkUserOwnsReminderTemplates(
    db: DbLike,
    userId: number,
    rtIds: Set<number>,
): TE.TaskEither<DoesNotExistError | AssertionError, void> {
    const conditions = Array.from(rtIds).map((rtId) =>
        and(eq(usersTable.id, userId), eq(reminderTemplatesTable.id, rtId)),
    );

    return pipe(
        TE.fromTask(() =>
            db
                .select()
                .from(usersTable)
                .innerJoin(
                    projectTemplatesTable,
                    eq(usersTable.id, projectTemplatesTable.userId),
                )
                .innerJoin(
                    eventTemplatesTable,
                    eq(
                        projectTemplatesTable.id,
                        eventTemplatesTable.projectTemplateId,
                    ),
                )
                .innerJoin(
                    reminderTemplatesTable,
                    eq(
                        eventTemplatesTable.id,
                        reminderTemplatesTable.eventTemplateId,
                    ),
                )
                .where(or(...conditions)),
        ),
        TE.chain((rows) => {
            if (rows.length < rtIds.size) {
                return TE.left(
                    DoesNotExistError() as DoesNotExistError | AssertionError,
                );
            }

            if (rows.length > rtIds.size) {
                return TE.left(
                    AssertionError(
                        "Unexpected multiple matching reminder templates",
                    ),
                );
            }

            return TE.right(undefined);
        }),
    );
}
