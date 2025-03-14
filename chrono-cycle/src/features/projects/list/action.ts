"use server";

import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";

import { ProjectOverview } from "@/common/data/domain";
import { UserSession } from "@/common/data/userSession";
import { RestoreAssertionError } from "@/common/errors";

import { wrapServerAction } from "@/features/utils/decorators";
import { validate } from "@/features/utils/validation";

import { bridge } from "./bridge";
import { Failure, Payload, payloadSchema, Result } from "./data";

async function listProjectsImpl(
    userSession: UserSession,
    payload: Payload,
): Promise<E.Either<RestoreAssertionError<Failure>, ProjectOverview[]>> {
    // Validate form schema.
    const task = pipe(
        TE.fromEither(validate(payloadSchema, payload)),
        TE.chain((payloadP) =>
            TE.fromTask(bridge(userSession.user.id, payloadP)),
        ),
    );

    return await task();
}

export const listProjectsAction: (payload: Payload) => Promise<Result> =
    wrapServerAction("listProjects", listProjectsImpl);
