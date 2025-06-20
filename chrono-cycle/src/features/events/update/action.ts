"use server";

import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import { revalidatePath } from "next/cache";

import { Event } from "@/common/data/domain";
import { UserSession } from "@/common/data/userSession";
import { AssertionError } from "@/common/errors";

import { wrapServerAction } from "@/features/utils/decorators";
import { validate } from "@/features/utils/validation";

import { bridge } from "./bridge";
import { Failure, Payload, payloadSchema, Result } from "./data";

async function updateEventActionImpl(
    userSession: UserSession,
    _prevState: Result | null,
    payload: Payload,
): Promise<E.Either<Failure | AssertionError, Event>> {
    const task = pipe(
        TE.fromEither(validate(payloadSchema, payload)),
        TE.chainW((payloadP) => bridge(userSession.user.id, payloadP)),
        TE.tapIO(() => () => revalidatePath("/dashboard")),
    );

    return await task();
}

export const updateEventAction: (
    _prevState: Result | null,
    payload: Payload,
) => Promise<Result> = wrapServerAction("updateEvent", updateEventActionImpl);
