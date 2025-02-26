"use server";

import { getCurrentSession } from "@/server/auth/sessions";
import { deleteProjectTemplate } from "./lib";
import { DeleteProjectTemplateResult } from "./data";
import { revalidatePath } from "next/cache";

export async function deleteProjectTemplateAction(
    _previousState: DeleteProjectTemplateResult,
    name: string,
): Promise<DeleteProjectTemplateResult> {
    // Verify user identity.
    const sessionResults = await getCurrentSession();
    if (!sessionResults) {
        return {
            success: false,
            errorMessage: "Authentication failed",
        };
    }

    const userId = sessionResults.user.id;

    // Project template names are unique, so we don't need the project template ID.
    const deleted = await deleteProjectTemplate(name, userId);
    if (!deleted) {
        return {
            success: false,
            errorMessage: "Project template does not exist",
        };
    }

    revalidatePath("/templates");
    return { success: true };
}
