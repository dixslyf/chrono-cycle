import { and, eq, or } from "drizzle-orm";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { AssertionError, DoesNotExistError } from "@/common/errors";

import { DbLike } from "@/db";
import {
    events as eventsTable,
    projects as projectsTable,
    users as usersTable,
} from "@/db/schema";

// Checks that the user owns the events.
export function checkUserOwnsEvents(
    db: DbLike,
    userId: number,
    eventIds: Set<number>,
): TE.TaskEither<DoesNotExistError | AssertionError, void> {
    const eventIdsArray = Array.from(eventIds);

    const conditions = eventIdsArray.map((eventId) =>
        and(eq(usersTable.id, userId), eq(eventsTable.id, eventId)),
    );

    return pipe(
        TE.fromTask(() =>
            db
                .select()
                .from(usersTable)
                .innerJoin(
                    projectsTable,
                    eq(usersTable.id, projectsTable.userId),
                )
                .innerJoin(
                    eventsTable,
                    eq(projectsTable.id, eventsTable.projectId),
                )
                .where(or(...conditions)),
        ),
        TE.chain((rows) => {
            if (rows.length < eventIdsArray.length) {
                return TE.left(
                    DoesNotExistError() as DoesNotExistError | AssertionError,
                );
            }

            if (rows.length > eventIdsArray.length) {
                return TE.left(
                    AssertionError("Unexpected multiple matching events"),
                );
            }

            return TE.right(undefined);
        }),
    );
}
