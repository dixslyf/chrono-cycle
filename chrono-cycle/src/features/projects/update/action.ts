"use server";

import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import { revalidatePath } from "next/cache";

import { ProjectOverview } from "@/common/data/domain";
import { UserSession } from "@/common/data/userSession";
import { RestoreAssertionError } from "@/common/errors";

import { wrapServerAction } from "@/features/utils/decorators";
import { validate } from "@/features/utils/validation";

import { bridge } from "./bridge";
import { Failure, Payload, payloadSchema, Result } from "./data";

async function updateProjectActionImpl(
    userSession: UserSession,
    _prevState: Result | null,
    payload: Payload,
): Promise<E.Either<RestoreAssertionError<Failure>, ProjectOverview>> {
    // Validate form schema.
    const task = pipe(
        TE.fromEither(validate(payloadSchema, payload)),
        TE.chainW((payloadP) => bridge(userSession.user.id, payloadP)),
        TE.tapIO(() => () => revalidatePath("/templates")),
    );

    return await task();
}

export const updateProjectAction: (
    _prevState: Result | null,
    payload: Payload,
) => Promise<Result> = wrapServerAction(
    "updateProject",
    updateProjectActionImpl,
);
