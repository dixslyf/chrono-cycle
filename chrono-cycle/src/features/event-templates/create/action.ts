"use server";

import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { EventTemplate } from "@common/data/domain";
import { UserSession } from "@common/data/userSession";
import { RestoreAssertionError } from "@common/errors";

import { wrapServerAction } from "@features/utils/decorators";

import { validate } from "../../utils/validation";
import { bridge } from "./bridge";
import { Failure, Payload, payloadSchema, Result } from "./data";

async function createEventTemplateActionImpl(
    userSession: UserSession,
    _prevState: Result | null,
    payload: Payload,
): Promise<E.Either<RestoreAssertionError<Failure>, EventTemplate>> {
    // Validate form schema.
    const task = pipe(
        TE.fromEither(validate(payloadSchema, payload)),
        TE.chainW((payloadP) => bridge(userSession.user.id, payloadP)),
        // TODO: What path to revalidate?
        // revalidatePath("/templates");
    );

    return await task();
}

export const createEventTemplateAction: (
    _prevState: Result | null,
    payload: Payload,
) => Promise<Result> = wrapServerAction(
    "createEventTemplate",
    createEventTemplateActionImpl,
);
