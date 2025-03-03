"use server";

import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";

import { retrieveProjectTemplate } from "./lib";
import { RetrieveResult } from "./data";
import { DoesNotExistError } from "@/server/common/errors";
import { checkAuth } from "@/server/auth/decorators";
import { UserSession } from "@/server/auth/sessions";

export const retrieveProjectTemplateAction = checkAuth(async function(
    userSession: UserSession,
    projectTemplateName: string,
): Promise<RetrieveResult> {
    // Check that the user owns the project template.
    const userId = userSession.user.id;

    // Retrieve the project template.
    const projectTemplate = await retrieveProjectTemplate(
        projectTemplateName,
        userId,
    );

    return pipe(
        projectTemplate,
        O.map((pt) => E.right(pt)),
        O.getOrElse(() => E.left(DoesNotExistError())),
    );
});
