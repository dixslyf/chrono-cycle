"use server";

import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";

import { UserSession } from "@/common/data/userSession";
import { RestoreAssertionError } from "@/common/errors";

import { wrapServerAction } from "@/features/utils/decorators";
import { validate } from "@/features/utils/validation";

import { bridge } from "./bridge";
import { Failure, Payload, payloadSchema, Result } from "./data";

async function deleteProjectImpl(
    userSession: UserSession,
    _previousState: Result | null,
    payload: Payload,
): Promise<E.Either<RestoreAssertionError<Failure>, void>> {
    // Validate form schema.
    const task = pipe(
        TE.fromEither(validate(payloadSchema, payload)),
        TE.chainW((payloadP) => bridge(userSession.user.id, payloadP)),
    );

    return await task();
}

export const deleteProjectAction: (
    _previousState: Result | null,
    payload: Payload,
) => Promise<Result> = wrapServerAction("deleteProject", deleteProjectImpl);
