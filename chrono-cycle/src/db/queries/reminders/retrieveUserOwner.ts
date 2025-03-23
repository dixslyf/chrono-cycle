import { eq, getTableColumns } from "drizzle-orm";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { AssertionError, DoesNotExistError } from "@/common/errors";

import { DbLike } from "@/db";
import {
    DbUser,
    events as eventsTable,
    projects as projectsTable,
    reminders as remindersTable,
    users as usersTable,
} from "@/db/schema";

export function retrieveUserOwner(
    db: DbLike,
    reminderId: number,
): TE.TaskEither<DoesNotExistError | AssertionError, DbUser> {
    return pipe(
        TE.fromTask(() =>
            db
                .select(getTableColumns(usersTable))
                .from(remindersTable)
                .innerJoin(
                    eventsTable,
                    eq(eventsTable.id, remindersTable.eventId),
                )
                .innerJoin(
                    projectsTable,
                    eq(projectsTable.id, eventsTable.projectId),
                )
                .innerJoin(usersTable, eq(usersTable.id, projectsTable.userId))
                .where(eq(remindersTable.id, reminderId)),
        ),
        TE.chain((rows) => {
            if (rows.length < 1) {
                return TE.left(
                    DoesNotExistError() as DoesNotExistError | AssertionError,
                );
            }

            if (rows.length > 1) {
                return TE.left(
                    AssertionError("Unexpected multiple matching users"),
                );
            }

            return TE.right(rows[0]);
        }),
    );
}
