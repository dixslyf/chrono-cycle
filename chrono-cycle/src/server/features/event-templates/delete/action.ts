"use server";

import { UserSession } from "@/server/common/auth/sessions";
import { ValidationError } from "@/server/common/errors";
import { wrapServerAction } from "@/server/features/decorators";
import * as E from "fp-ts/Either";

import {
    DeleteEventTemplateData,
    deleteEventTemplatesDataSchema,
    DeleteEventTemplatesResult,
} from "./data";
import { deleteEventTemplates } from "./lib";

async function deleteEventTemplatesImpl(
    userSession: UserSession,
    _previousState: DeleteEventTemplatesResult | null,
    data: DeleteEventTemplateData,
): Promise<DeleteEventTemplatesResult> {
    // Validate form schema.
    const parseResult = deleteEventTemplatesDataSchema.safeParse(data);
    if (!parseResult.success) {
        const formattedZodErrors = parseResult.error.format();
        return E.left(
            ValidationError({
                eventTemplateIds:
                    formattedZodErrors.eventTemplateIds?._errors || [],
            }),
        );
    }

    return await deleteEventTemplates(
        userSession.user.id,
        parseResult.data.eventTemplateIds,
    );
}

export const deleteEventTemplatesAction = wrapServerAction(
    "deleteEventTemplates",
    deleteEventTemplatesImpl,
);
