"use server";

import { UserSession } from "@/server/common/auth/sessions";
import { DoesNotExistError } from "@/server/common/errors";
import { wrapServerAction } from "@/server/features/decorators";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";

import { RetrieveResult } from "./data";
import { retrieveProjectTemplate } from "./lib";

async function retrieveProjectTemplateImpl(
    userSession: UserSession,
    projectTemplateId: string,
): Promise<RetrieveResult> {
    // Check that the user owns the project template.
    const userId = userSession.user.id;

    // Retrieve the project template.
    const projectTemplate = await retrieveProjectTemplate(
        projectTemplateId,
        userId,
    );

    return pipe(
        projectTemplate,
        O.map((pt) => E.right(pt)),
        O.getOrElse(() => E.left(DoesNotExistError())),
    );
}

export const retrieveProjectTemplateAction = wrapServerAction(
    "retrieveProjectTemplate",
    retrieveProjectTemplateImpl,
);
