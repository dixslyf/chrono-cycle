import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";

import { toUserSettings, UserSettings } from "@/common/data/userSession";
import { AssertionError, DoesNotExistError } from "@/common/errors";

import getDb from "@/db";
import { retrieveUserSettings } from "@/db/queries/auth/retrieveUser";

export function bridge(
    userId: number,
): TE.TaskEither<DoesNotExistError | AssertionError, UserSettings> {
    return pipe(
        TE.fromTask(getDb),
        TE.chain((db) => retrieveUserSettings(db, userId)),
        TE.map(toUserSettings),
    );
}
