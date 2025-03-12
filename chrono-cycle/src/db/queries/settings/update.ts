import { eq } from "drizzle-orm";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { AssertionError, DoesNotExistError } from "@common/errors";

import { DbLike } from "@db";
import {
    DbUserSettings,
    DbUserSettingsUpdate,
    userSettings as userSettingsTable,
} from "@db/schema";

export function updateUserSettings(
    db: DbLike,
    data: DbUserSettingsUpdate,
): TE.TaskEither<DoesNotExistError | AssertionError, DbUserSettings> {
    const { userId, ...rest } = data;
    return pipe(
        TE.fromTask(() =>
            db
                .update(userSettingsTable)
                .set(rest)
                .where(eq(userSettingsTable.userId, userId))
                .returning(),
        ),
        TE.chainW((updated) => {
            if (updated.length < 1) {
                return TE.left(
                    DoesNotExistError() as DoesNotExistError | AssertionError,
                );
            }

            if (updated.length > 1) {
                return TE.left(
                    AssertionError("Unexpected multiple user settings updated"),
                );
            }

            return TE.right(updated[0]);
        }),
    );
}
