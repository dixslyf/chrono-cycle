"use server";

import { UserSession } from "@/server/common/auth/sessions";
import { ValidationError } from "@/server/common/errors";
import { wrapServerAction } from "@/server/features/decorators";
import * as E from "fp-ts/Either";

import { CreateResult, reminderTemplateCreateSchema } from "./data";
import { createReminderTemplates } from "./lib";

async function createReminderTemplateActionImpl(
    userSession: UserSession,
    _prevState: CreateResult | null,
    formData: FormData,
): Promise<CreateResult> {
    // Validate form schema.
    const parseResult = reminderTemplateCreateSchema.safeParse(formData);
    if (!parseResult.success) {
        const formattedZodErrors = parseResult.error.format();
        return E.left(
            ValidationError({
                eventTemplateId:
                    formattedZodErrors.eventTemplateId?._errors || [],
                daysBeforeEvent:
                    formattedZodErrors.daysBeforeEvent?._errors || [],
                time: formattedZodErrors.time?._errors || [],
                emailNotifications:
                    formattedZodErrors.emailNotifications?._errors || [],
                desktopNotifications:
                    formattedZodErrors.desktopNotifications?._errors || [],
            }),
        );
    }

    const userId = userSession.user.id;
    const createResult = await createReminderTemplates(userId, [
        parseResult.data,
    ]);

    if (E.isRight(createResult)) {
        // TODO: What path to revalidate?
        // revalidatePath("/templates");
    }

    return createResult;
}

export const createReminderTemplateAction = wrapServerAction(
    "createReminderTemplate",
    createReminderTemplateActionImpl,
);
