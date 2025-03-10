"use server";

import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";
import { revalidatePath } from "next/cache";

import { UserSession } from "@common/data/userSession";

import { wrapServerAction } from "@features/utils/decorators";
import { validate } from "@features/utils/validation";

import { bridge } from "./bridge";
import { payloadSchema, Result } from "./data";

async function createProjectTemplateActionImpl(
    userSession: UserSession,
    _prevState: Result | null,
    payload: FormData,
): Promise<Result> {
    return await pipe(
        TE.fromEither(
            validate(payloadSchema, {
                name: payload.get("name"),
                description: payload.get("description"),
            }),
        ),
        TE.chain((payloadP) => bridge(userSession.user.id, payloadP)),
        TE.tap((_) => TE.fromIO(() => revalidatePath("/templates"))),
    )();
}

export const createProjectTemplateAction = wrapServerAction(
    "createProjectTemplate",
    createProjectTemplateActionImpl,
);
