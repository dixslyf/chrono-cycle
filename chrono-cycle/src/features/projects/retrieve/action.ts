"use server";

import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { Project } from "@/common/data/domain";
import { UserSession } from "@/common/data/userSession";
import { RestoreAssertionError } from "@/common/errors";

import { wrapServerAction } from "@/features/utils/decorators";
import { validate } from "@/features/utils/validation";

import { bridge } from "./bridge";
import { Failure, Payload, payloadSchema } from "./data";

async function retrieveProjectImpl(
    userSession: UserSession,
    payload: Payload,
): Promise<E.Either<RestoreAssertionError<Failure>, Project>> {
    const task = pipe(
        TE.fromEither(validate(payloadSchema, payload)),
        TE.chainW((payloadP) => bridge(userSession.user.id, payloadP)),
    );
    return await task();
}

export const retrieveProjectAction = wrapServerAction(
    "retrieveProject",
    retrieveProjectImpl,
);
