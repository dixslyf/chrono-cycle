import { eq } from "drizzle-orm";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { AssertionError, DoesNotExistError } from "@root/src/common/errors";

import { DbLike } from "@db";
import { DbSession, DbUser, sessions, users } from "@db/schema";

export function retrieveUserSession(
    db: DbLike,
    sessionId: string,
): TE.TaskEither<
    DoesNotExistError | AssertionError,
    { user: DbUser; session: DbSession }
> {
    return pipe(
        TE.fromTask(() =>
            db
                .select({ user: users, session: sessions })
                .from(sessions)
                .innerJoin(users, eq(sessions.userId, users.id))
                .where(eq(sessions.id, sessionId)),
        ),
        TE.chain((selected) => {
            if (selected.length < 1) {
                return TE.left(
                    DoesNotExistError() as DoesNotExistError | AssertionError,
                );
            }

            if (selected.length > 1) {
                return TE.left(
                    AssertionError(
                        "Unexpected multiple matching user sessions",
                    ),
                );
            }

            return TE.right(selected[0]);
        }),
    );
}
