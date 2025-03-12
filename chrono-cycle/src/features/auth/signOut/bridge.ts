import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { AssertionError, DoesNotExistError } from "@/common/errors";

import {
    deleteSessionTokenCookie,
    invalidateSession,
} from "@/lib/auth/sessions";

export function bridge(
    sessionId: string,
): TE.TaskEither<DoesNotExistError | AssertionError, void> {
    return pipe(
        () => invalidateSession(sessionId),
        TE.chain(() => TE.fromTask(deleteSessionTokenCookie)),
    );
}
