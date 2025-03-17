"use server";

import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import { revalidatePath } from "next/cache";

import { Project } from "@/common/data/domain";
import { UserSession } from "@/common/data/userSession";
import { RestoreAssertionError } from "@/common/errors";

import { wrapServerAction } from "@/features/utils/decorators";
import { validate } from "@/features/utils/validation";

import { bridge } from "./bridge";
import { Failure, Payload, payloadSchema, Result } from "./data";

async function createProjectActionImpl(
    userSession: UserSession,
    payload: Payload,
): Promise<E.Either<RestoreAssertionError<Failure>, Project>> {
    // Validate form schema.
    const task = pipe(
        TE.fromEither(validate(payloadSchema, payload)),
        TE.chainW((payloadP) => bridge(userSession.user.id, payloadP)),
        TE.tapIO(() => () => revalidatePath("/dashboard")),
    );

    return await task();
}

export const createProjectAction: (payload: Payload) => Promise<Result> =
    wrapServerAction("createProject", createProjectActionImpl);
