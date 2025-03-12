import { eq } from "drizzle-orm";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { AssertionError, DoesNotExistError } from "@/common/errors";

import { DbLike } from "@/db";
import { DbUser, DbUserSettings, users, userSettings } from "@/db/schema";

export function retrieveUserByUsername(
    db: DbLike,
    username: string,
): TE.TaskEither<DoesNotExistError | AssertionError, DbUser> {
    return pipe(
        TE.fromTask(() =>
            db.select().from(users).where(eq(users.username, username)),
        ),
        TE.chain((selected) => {
            if (selected.length < 1) {
                return TE.left(
                    DoesNotExistError() as DoesNotExistError | AssertionError,
                );
            }

            if (selected.length > 1) {
                return TE.left(
                    AssertionError("Unexpected multiple matching users"),
                );
            }

            return TE.right(selected[0]);
        }),
    );
}

export function retrieveUserByEmail(
    db: DbLike,
    email: string,
): TE.TaskEither<DoesNotExistError | AssertionError, DbUser> {
    return pipe(
        TE.fromTask(() =>
            db.select().from(users).where(eq(users.email, email)),
        ),
        TE.chain((selected) => {
            if (selected.length < 1) {
                return TE.left(
                    DoesNotExistError() as DoesNotExistError | AssertionError,
                );
            }

            if (selected.length > 1) {
                return TE.left(
                    AssertionError("Unexpected multiple matching users"),
                );
            }

            return TE.right(selected[0]);
        }),
    );
}

export function retrieveUserSettings(
    db: DbLike,
    userId: number,
): TE.TaskEither<DoesNotExistError | AssertionError, DbUserSettings> {
    return pipe(
        TE.fromTask(() =>
            db
                .select()
                .from(userSettings)
                .where(eq(userSettings.userId, userId)),
        ),
        TE.chain((selected) => {
            if (selected.length < 1) {
                return TE.left(
                    DoesNotExistError() as DoesNotExistError | AssertionError,
                );
            }

            if (selected.length > 1) {
                return TE.left(
                    AssertionError("Unexpected multiple matching users"),
                );
            }

            return TE.right(selected[0]);
        }),
    );
}
