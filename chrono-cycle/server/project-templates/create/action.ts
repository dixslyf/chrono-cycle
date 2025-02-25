"use server";

import { getCurrentSession } from "@/server/auth/sessions";
import {
    createProjectTemplateFormSchema,
    CreateProjectTemplateFormState,
} from "./formData";
import { insertProjectTemplateDb, isDuplicateProjectTemplateName } from "./lib";

export async function createProjectTemplate(
    _prevState: CreateProjectTemplateFormState,
    formData: FormData,
): Promise<CreateProjectTemplateFormState> {
    // Validate form schema.
    const parseResult = createProjectTemplateFormSchema.safeParse({
        name: formData.get("name"),
        description: formData.get("description"),
    });

    if (!parseResult.success) {
        const formattedZodErrors = parseResult.error.format();
        return {
            submitSuccess: false,
            errorMessage: "Invalid or missing fields",
            errors: {
                name: formattedZodErrors.name?._errors[0],
                description: formattedZodErrors.description?._errors[0],
            },
        };
    }

    // Verify user identity.
    const sessionResults = await getCurrentSession();
    if (!sessionResults) {
        return {
            submitSuccess: false,
            errorMessage: "Authentication failed",
        };
    }

    const { name, description } = parseResult.data;
    const userId = sessionResults.user.id;

    // Check if name is taken.
    if (await isDuplicateProjectTemplateName(name, userId)) {
        return {
            submitSuccess: false,
            errorMessage: "Project template name has already been used",
        };
    }

    await insertProjectTemplateDb(name, description, userId);
    return { submitSuccess: true };
}
