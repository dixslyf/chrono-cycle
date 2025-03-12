import { eq } from "drizzle-orm";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";

import { AssertionError, DoesNotExistError } from "@common/errors";

import { DbLike } from "@db";
import { DbUserSettings, userSettings as userSettingsTable } from "@db/schema";

export function retrieveUserSettings(
    db: DbLike,
    userId: number,
): TE.TaskEither<DoesNotExistError | AssertionError, DbUserSettings> {
    return pipe(
        TE.fromTask(() =>
            db
                .select()
                .from(userSettingsTable)
                .where(eq(userSettingsTable.userId, userId)),
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
                        "Unexpected multiple matching user settings",
                    ),
                );
            }

            return TE.right(selected[0]);
        }),
    );
}
