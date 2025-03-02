"use server";

import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";

import { getCurrentSession } from "@/server/auth/sessions";
import { retrieveProjectTemplate } from "./lib";
import { RetrieveResult } from "./data";

export async function retrieveProjectTemplateAction(
    projectTemplateName: string,
): Promise<RetrieveResult> {
    // Verify user identity.
    const sessionResults = await getCurrentSession();
    if (!sessionResults) {
        return E.left({ _errorKind: "AuthenticationError" });
    }

    // Check that the user owns the project template.
    const userId = sessionResults.user.id;

    // Retrieve the project template.
    const projectTemplate = await retrieveProjectTemplate(
        projectTemplateName,
        userId,
    );

    return pipe(
        projectTemplate,
        O.map((pt) => E.right(pt)),
        O.getOrElse(() => E.left({ _errorKind: "DoesNotExistError" })),
    );
}
