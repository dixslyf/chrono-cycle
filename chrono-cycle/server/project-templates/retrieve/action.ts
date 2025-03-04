"use server";

import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";

import { retrieveProjectTemplate } from "./lib";
import { RetrieveResult } from "./data";
import { DoesNotExistError } from "@/server/common/errors";
import { UserSession } from "@/server/auth/sessions";
import { wrapServerAction } from "@/server/decorators";

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
