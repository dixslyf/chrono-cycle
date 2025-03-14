import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { toUserSettings, UserSettings } from "@/common/data/userSession";
import { AssertionError, DoesNotExistError } from "@/common/errors";

import getDb from "@/db";
import { updateUserSettings } from "@/db/queries/settings/update";

import { ParsedPayload } from "./data";

export function bridge(
    userId: number,
    payloadP: ParsedPayload,
): TE.TaskEither<DoesNotExistError | AssertionError, UserSettings> {
    return pipe(
        TE.fromTask(getDb),
        TE.chain((db) => updateUserSettings(db, { userId, ...payloadP })),
        TE.map(toUserSettings),
    );
}
