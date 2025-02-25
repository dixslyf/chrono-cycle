"use server";

import { getCurrentSession } from "@/server/auth/sessions";
import { retrieveProjectTemplate } from "./lib";
import { RetrieveProjectTemplateResult } from "./data";

export async function retrieveProjectTemplateAction(
    projectTemplateName: string,
): Promise<RetrieveProjectTemplateResult> {
    // Verify user identity.
    const sessionResults = await getCurrentSession();
    if (!sessionResults) {
        return {
            success: false,
            errorMessage: "Authentication failed",
        };
    }

    // Check that the user owns the project template.
    const userId = sessionResults.user.id;

    // Retrieve the project template.
    const projectTemplate = await retrieveProjectTemplate(
        projectTemplateName,
        userId,
    );

    if (!projectTemplate) {
        return {
            success: false,
            errorMessage: "Project template does not exist",
        };
    }

    return {
        success: true,
        projectTemplate,
    };
}
