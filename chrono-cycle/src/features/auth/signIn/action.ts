"use server";

import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import { redirect } from "next/navigation";

import { RestoreAssertionError } from "@/common/errors";

import { wrapServerActionWith } from "@/features/utils/decorators";
import { validate } from "@/features/utils/validation";

import { bridge } from "./bridge";
import { Failure, Payload, payloadSchema, Result } from "./data";

async function signInActionImpl(
    _prevState: Result | null,
    payload: Payload,
): Promise<E.Either<RestoreAssertionError<Failure>, never>> {
    // Validate form inputs.
    const task = pipe(
        TE.fromEither(validate(payloadSchema, payload)),
        TE.chainW((payloadP) => bridge(payloadP)),
        TE.map(() => redirect("/dashboard")),
    );

    return await task();
}

export const signInAction = wrapServerActionWith(
    "signIn",
    { auth: false },
    signInActionImpl,
);
