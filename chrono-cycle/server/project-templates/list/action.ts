"use server";

import { getCurrentSession } from "@/server/auth/sessions";
import { getProjectTemplatesForUser } from "./lib";
import { ListProjectTemplatesResult } from "./data";

export async function listProjectTemplates(): Promise<ListProjectTemplatesResult> {
    // Verify user identity.
    const sessionResults = await getCurrentSession();
    if (!sessionResults) {
        return {
            success: false,
            errorMessage: "Authentication failed",
        };
    }

    // Fetch project templates for the user.
    const userId = sessionResults.user.id;
    const result = {
        success: true,
        projectTemplates: await getProjectTemplatesForUser(userId),
    };

    return result;
}
