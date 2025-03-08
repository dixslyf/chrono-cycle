"use server";

import * as E from "fp-ts/Either";

import { CreateFormData, CreateResult, createFormDataSchema } from "./data";
import { createEventTemplate } from "./lib";
import { UserSession } from "@/server/auth/sessions";
import { ValidationError } from "@/server/common/errors";
import { wrapServerAction } from "@/server/decorators";

async function createEventTemplateActionImpl(
    userSession: UserSession,
    _prevState: CreateResult | null,
    data: CreateFormData,
): Promise<CreateResult> {
    // Validate form schema.
    const parseResult = createFormDataSchema.safeParse(data);
    if (!parseResult.success) {
        const formattedZodErrors = parseResult.error.format();
        return E.left(
            ValidationError({
                name: formattedZodErrors.name?._errors || [],
                offsetDays: formattedZodErrors.offsetDays?._errors || [],
                duration: formattedZodErrors.duration?._errors || [],
                note: formattedZodErrors.note?._errors || [],
                eventType: formattedZodErrors.eventType?._errors || [],
                autoReschedule:
                    formattedZodErrors.autoReschedule?._errors || [],
                projectTemplateId:
                    formattedZodErrors.projectTemplateId?._errors || [],
            }),
        );
    }

    const userId = userSession.user.id;
    const createResult = await createEventTemplate(userId, parseResult.data);

    if (E.isRight(createResult)) {
        // TODO: What path to revalidate?
        // revalidatePath("/templates");
    }

    return createResult;
}

export const createEventTemplateAction = wrapServerAction(
    "createEventTemplate",
    createEventTemplateActionImpl,
);
