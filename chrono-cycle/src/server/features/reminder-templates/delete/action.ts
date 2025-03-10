"use server";

import { UserSession } from "@/server/common/auth/sessions";
import { ValidationError } from "@/server/common/errors";
import { wrapServerAction } from "@/server/features/decorators";
import * as E from "fp-ts/Either";

import {
    DeleteReminderTemplateData,
    deleteReminderTemplatesDataSchema,
    DeleteReminderTemplatesResult,
} from "./data";
import { deleteReminderTemplates } from "./lib";

async function deleteReminderTemplatesImpl(
    userSession: UserSession,
    _previousState: DeleteReminderTemplatesResult | null,
    data: DeleteReminderTemplateData,
): Promise<DeleteReminderTemplatesResult> {
    // Validate form schema.
    const parseResult = deleteReminderTemplatesDataSchema.safeParse(data);
    if (!parseResult.success) {
        const formattedZodErrors = parseResult.error.format();
        return E.left(
            ValidationError({
                reminderTemplateIds:
                    formattedZodErrors.reminderTemplateIds?._errors || [],
            }),
        );
    }

    return await deleteReminderTemplates(
        userSession.user.id,
        parseResult.data.reminderTemplateIds,
    );
}

export const deleteReminderTemplatesAction = wrapServerAction(
    "deleteReminderTemplates",
    deleteReminderTemplatesImpl,
);
