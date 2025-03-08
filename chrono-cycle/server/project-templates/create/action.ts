"use server";

import * as E from "fp-ts/Either";

import { UserSession } from "@/server/auth/sessions";
import { createFormSchema, CreateResult } from "./data";
import { insertProjectTemplateDb, isDuplicateProjectTemplateName } from "./lib";
import { revalidatePath } from "next/cache";
import { DuplicateNameError, ValidationError } from "@/server/common/errors";
import { encodeProjectTemplateId } from "@/server/common/identifiers";
import { wrapServerAction } from "@/server/decorators";

async function createProjectTemplateActionImpl(
    userSession: UserSession,
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

    const { name, description } = parseResult.data;
    const userId = userSession.user.id;

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

export const createProjectTemplateAction = wrapServerAction(
    "createProjectTemplate",
    createProjectTemplateActionImpl,
);
