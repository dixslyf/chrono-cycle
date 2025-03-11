import { eq } from "drizzle-orm";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { AssertionError, DoesNotExistError } from "@root/src/common/errors";

import { DbLike } from "@db";
import { DbSession, sessions as sessionsTable } from "@db/schema";

export function deleteSession(
    db: DbLike,
    sessionId: string,
): TE.TaskEither<DoesNotExistError | AssertionError, DbSession> {
    return pipe(
        TE.fromTask(() =>
            db
                .delete(sessionsTable)
                .where(eq(sessionsTable.id, sessionId))
                .returning(),
        ),
        TE.chain((deleted) => {
            if (deleted.length < 1) {
                return TE.left(
                    DoesNotExistError() as DoesNotExistError | AssertionError,
                );
            }

            if (deleted.length > 1) {
                return TE.left(
                    AssertionError("Unexpected multiple deleted sessions"),
                );
            }

            return TE.right(deleted[0]);
        }),
    );
}
