import * as E from "fp-ts/Either";

import {
    DoesNotExistError,
    InternalError,
    ValidationError,
} from "@/server/common/errors";
import { ReminderTemplate } from "@/server/common/data";
import { reminderTemplateInsertSchema } from "@/server/db/schema";
import { encodedIdSchema } from "@/server/common/identifiers";
import { z } from "zod";

export const createFormDataSchema = z.object({
    eventTemplateId: encodedIdSchema,
    daysBeforeEvent: reminderTemplateInsertSchema.shape.daysBeforeEvent,
    time: reminderTemplateInsertSchema.shape.time,
    emailNotifications: reminderTemplateInsertSchema.shape.emailNotifications,
    desktopNotifications:
        reminderTemplateInsertSchema.shape.desktopNotifications,
});

export type CreateFormData = z.output<typeof createFormDataSchema>;

export type DuplicateReminderError = {
    _errorKind: "DuplicateReminderError";
};

export function DuplicateReminderError(): DuplicateReminderError {
    return { _errorKind: "DuplicateReminderError" };
}

export type CreateError =
    | ValidationError<
        | "daysBeforeEvent"
        | "time"
        | "emailNotifications"
        | "desktopNotifications"
    >
    | DuplicateReminderError
    | DoesNotExistError
    | InternalError;

export type CreateResult = E.Either<CreateError, ReminderTemplate>;
