"use server";

import { getCurrentSession } from "@/server/auth/sessions";
import {
    createProjectTemplateFormSchema,
    CreateProjectTemplateFormState,
} from "./formData";
import { insertProjectTemplateDb, isDuplicateProjectTemplateName } from "./lib";
import { revalidatePath } from "next/cache";

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

    const inserted = await insertProjectTemplateDb(name, description, userId);

    revalidatePath("/templates");
    return {
        submitSuccess: true,
        createdProjectTemplate: {
            name: inserted.name,
            description: inserted.description,
            createdAt: inserted.createdAt,
            updatedAt: inserted.updatedAt,
        },
    };
}
