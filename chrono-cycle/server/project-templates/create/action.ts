"use server";

import * as E from "fp-ts/Either";

import { getCurrentSession } from "@/server/auth/sessions";
import { createFormSchema, CreateResult, DuplicateNameError } from "./data";
import { insertProjectTemplateDb, isDuplicateProjectTemplateName } from "./lib";
import { revalidatePath } from "next/cache";
import { AuthenticationError, ValidationError } from "@/server/common/errors";
import { encodeProjectTemplateId } from "@/server/common/identifiers";

export async function createProjectTemplateAction(
    _prevState: CreateResult | null,
    formData: FormData,
): Promise<CreateResult> {
    // Validate form schema.
    const parseResult = createFormSchema.safeParse({
        name: formData.get("name"),
        description: formData.get("description"),
    });

    if (!parseResult.success) {
        const formattedZodErrors = parseResult.error.format();
        return E.left(
            ValidationError({
                name: formattedZodErrors.name?._errors || [],
                description: formattedZodErrors.description?._errors || [],
            }),
        );
    }

    // Verify user identity.
    const sessionResults = await getCurrentSession();
    if (!sessionResults) {
        return E.left(AuthenticationError());
    }

    const { name, description } = parseResult.data;
    const userId = sessionResults.user.id;

    // Check if name is taken.
    if (await isDuplicateProjectTemplateName(name, userId)) {
        return E.left(DuplicateNameError());
    }

    const inserted = await insertProjectTemplateDb(name, description, userId);

    revalidatePath("/templates");
    return E.right({
        id: encodeProjectTemplateId(inserted.id),
        name: inserted.name,
        description: inserted.description,
        createdAt: inserted.createdAt,
        updatedAt: inserted.updatedAt,
    });
}
