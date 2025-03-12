"use server";

import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";

import { EventTemplate } from "@common/data/domain";
import { UserSession } from "@common/data/userSession";
import { RestoreAssertionError } from "@common/errors";

import { wrapServerAction } from "@features/utils/decorators";
import { validate } from "@features/utils/validation";

import { bridge } from "./bridge";
import { Failure, payloadSchema, Result } from "./data";

async function listEventTemplatesActionImpl(
    userSession: UserSession,
    _prevState: Result | null,
    formData: FormData,
): Promise<E.Either<RestoreAssertionError<Failure>, EventTemplate[]>> {
    // Validate form schema.
    const task = pipe(
        TE.fromEither(
            validate(payloadSchema, {
                projectTemplateId: formData.get("projectTemplateId"),
            }),
        ),
        TE.chainW((payloadP) => bridge(userSession.user.id, payloadP)),
    );

    return await task();
}

export const listEventTemplatesAction: (
    _prevState: Result | null,
    formData: FormData,
) => Promise<Result> = wrapServerAction(
    "listEventTemplates",
    listEventTemplatesActionImpl,
);
