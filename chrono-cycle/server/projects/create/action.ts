"use server";

import * as E from "fp-ts/Either";

import { UserSession } from "@/server/auth/sessions";
import { createFormSchema, CreateResult } from "./data";
import { ValidationError } from "@/server/common/errors";
import { wrapServerAction } from "@/server/decorators";
import { createProject } from "./lib";

async function createProjectActionImpl(
    userSession: UserSession,
    _prevState: CreateResult | null,
    formData: FormData,
): Promise<CreateResult> {
    // Validate form schema.
    const parseResult = createFormSchema.safeParse({
        name: formData.get("name"),
        description: formData.get("description"),
        startsAt: formData.get("startsAt"),
        projectTemplateId: formData.get("projectTemplateId"),
    });

    if (!parseResult.success) {
        const formattedZodErrors = parseResult.error.format();
        return E.left(
            ValidationError({
                name: formattedZodErrors.name?._errors || [],
                description: formattedZodErrors.description?._errors || [],
                startsAt: formattedZodErrors.startsAt?._errors || [],
                projectTemplateId:
                    formattedZodErrors.projectTemplateId?._errors || [],
            }),
        );
    }

    // TODO: What path to revalidate?
    // revalidatePath("/templates");
    return await createProject(userSession.user.id, parseResult.data);
}

export const createProjectAction = wrapServerAction(
    "createProject",
    createProjectActionImpl,
);
