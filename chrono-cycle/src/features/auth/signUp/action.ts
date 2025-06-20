"use server";

import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";

import { RestoreAssertionError } from "@/common/errors";

import { wrapServerActionWith } from "@/features/utils/decorators";
import { validate } from "@/features/utils/validation";

import { bridge } from "./bridge";
import { Failure, Payload, payloadSchema, Result } from "./data";

async function signUpActionImpl(
    _prevState: Result | null,
    payload: Payload,
): Promise<E.Either<RestoreAssertionError<Failure>, void>> {
    // Validate form schema.
    const task = pipe(
        TE.fromEither(validate(payloadSchema, payload)),
        TE.chainW((payloadP) => bridge(payloadP)),
    );
    return await task();
}

export const signUpAction = wrapServerActionWith(
    "signUp",
    { auth: false },
    signUpActionImpl,
);
