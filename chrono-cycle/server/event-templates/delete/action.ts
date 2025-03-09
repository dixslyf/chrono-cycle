"use server";

import * as E from "fp-ts/Either";

import { UserSession } from "@/server/auth/sessions";
import { deleteEventTemplates } from "./lib";
import {
    DeleteEventTemplateData,
    deleteEventTemplatesDataSchema,
    DeleteEventTemplatesResult,
} from "./data";
import { ValidationError } from "@/server/common/errors";
import { wrapServerAction } from "@/server/decorators";

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
