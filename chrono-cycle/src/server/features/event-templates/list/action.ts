"use server";

import * as E from "fp-ts/Either";

import { ListResult, listFormDataSchema } from "./data";
import { listEventTemplates } from "./lib";
import { UserSession } from "@/server/common/auth/sessions";
import { ValidationError } from "@/server/common/errors";
import { wrapServerAction } from "@/server/features/decorators";

async function listEventTemplatesActionImpl(
    userSession: UserSession,
    _prevState: ListResult | null,
    formData: FormData,
): Promise<ListResult> {
    // Validate form schema.
    const parseResult = listFormDataSchema.safeParse(formData);
    if (!parseResult.success) {
        const formattedZodErrors = parseResult.error.format();
        return E.left(
            ValidationError({
                projectTemplateId:
                    formattedZodErrors.projectTemplateId?._errors || [],
            }),
        );
    }

    return await listEventTemplates(
        userSession.user.id,
        parseResult.data.projectTemplateId,
    );
}

export const listEventTemplatesAction = wrapServerAction(
    "listEventTemplates",
    listEventTemplatesActionImpl,
);
