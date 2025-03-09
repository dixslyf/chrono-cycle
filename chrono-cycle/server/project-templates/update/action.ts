"use server";

import * as E from "fp-ts/Either";

import { UserSession } from "@/server/auth/sessions";
import { UpdateData, updateDataSchema, UpdateResult } from "./data";
import { revalidatePath } from "next/cache";
import { ValidationError } from "@/server/common/errors";
import { wrapServerAction } from "@/server/decorators";
import { updateProjectTemplate } from "./lib";
import getDb from "@/server/db";

async function updateProjectTemplateActionImpl(
    userSession: UserSession,
    _prevState: UpdateResult | null,
    updateData: UpdateData,
): Promise<UpdateResult> {
    // Validate form schema.
    const parseResult = updateDataSchema.safeParse(updateData);
    if (!parseResult.success) {
        const formattedZodErrors = parseResult.error.format();
        return E.left(
            ValidationError({
                id: formattedZodErrors.id?._errors || [],
                name: formattedZodErrors.name?._errors || [],
                description: formattedZodErrors.description?._errors || [],
            }),
        );
    }

    const db = await getDb();
    const task = updateProjectTemplate(
        db,
        userSession.user.id,
        parseResult.data,
    );
    const updated = await task();
    revalidatePath("/templates");
    return updated;
}

export const updateProjectTemplateAction = wrapServerAction(
    "updateProjectTemplate",
    updateProjectTemplateActionImpl,
);
