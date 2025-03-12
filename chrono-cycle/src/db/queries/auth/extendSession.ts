import { eq } from "drizzle-orm";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { AssertionError, DoesNotExistError } from "@/common/errors";

import { DbLike } from "@/db";
import { DbSession, sessions as sessionsTable } from "@/db/schema";

export function extendSession(
    db: DbLike,
    sessionId: string,
    ms: number,
): TE.TaskEither<DoesNotExistError | AssertionError, DbSession> {
    return pipe(
        TE.fromTask(() =>
            db
                .update(sessionsTable)
                .set({ expiresAt: new Date(Date.now() + ms) })
                .where(eq(sessionsTable.id, sessionId))
                .returning(),
        ),
        TE.chain((updated) => {
            if (updated.length < 1) {
                return TE.left(
                    DoesNotExistError() as DoesNotExistError | AssertionError,
                );
            }

            if (updated.length > 1) {
                return TE.left(
                    AssertionError("Unexpected multiple updated sessions"),
                );
            }

            return TE.right(updated[0]);
        }),
    );
}
