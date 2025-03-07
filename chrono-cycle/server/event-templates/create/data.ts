import * as E from "fp-ts/Either";
import { z } from "zod";

import {
    DoesNotExistError,
    InternalError,
    ValidationError,
} from "@/server/common/errors";
import { eventTemplateInsertSchema } from "@/server/db/schema/eventTemplates";
import { EventTemplate, tagNameSchema } from "@/server/common/data";
import { CreateError as CreateTagError } from "@/server/tags/create/data";
import { encodedIdSchema } from "@/server/common/identifiers";
import { createFormDataSchema as createReminderTemplateFormDataSchema } from "@/server/reminder-templates/create/data";

export const createFormDataSchema = z.object({
    name: eventTemplateInsertSchema.shape.name,
    offsetDays: eventTemplateInsertSchema.shape.offsetDays,
    duration: eventTemplateInsertSchema.shape.duration,
    note: eventTemplateInsertSchema.shape.note,
    eventType: eventTemplateInsertSchema.shape.eventType,
    autoReschedule: eventTemplateInsertSchema.shape.autoReschedule,
    projectTemplateId: encodedIdSchema, // Sqid, not the actual ID.
    reminders: z.array(
        createReminderTemplateFormDataSchema.omit({ eventTemplateId: true }),
    ),
    tags: z.array(tagNameSchema),
});

export type CreateFormData = z.output<typeof createFormDataSchema>;

export type CreateReturnData = EventTemplate;

export type CreateError =
    | ValidationError<
        | "name"
        | "offsetDays"
        | "duration"
        | "note"
        | "eventType"
        | "autoReschedule"
        | "projectTemplateId"
    >
    | DoesNotExistError
    | InternalError
    | CreateTagError;

export type CreateResult = E.Either<CreateError, CreateReturnData>;
