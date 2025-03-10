import { EventTemplate, tagNameSchema } from "@/server/common/data";
import {
    DoesNotExistError,
    InternalError,
    ValidationError,
} from "@/server/common/errors";
import { encodedIdSchema } from "@/server/common/identifiers";
import { eventTemplateInsertSchema } from "@/server/db/schema/eventTemplates";
import { reminderTemplateCreateSchema } from "@/server/features/reminder-templates/create/data";
import { CreateError as CreateTagError } from "@/server/features/tags/create/data";
import * as E from "fp-ts/Either";
import { z } from "zod";

export const createFormDataSchema = z
    .object({
        name: eventTemplateInsertSchema.shape.name,
        offsetDays: eventTemplateInsertSchema.shape.offsetDays,
        duration: eventTemplateInsertSchema.shape.duration,
        note: eventTemplateInsertSchema.shape.note,
        eventType: eventTemplateInsertSchema.shape.eventType,
        autoReschedule: eventTemplateInsertSchema.shape.autoReschedule,
        projectTemplateId: encodedIdSchema, // Sqid, not the actual ID.
        reminders: z.array(
            reminderTemplateCreateSchema.omit({ eventTemplateId: true }),
        ),
        tags: z.array(tagNameSchema),
    })
    .refine(
        (val) => (val.eventType === "task" ? val.duration === 1 : true),
        "Duration for a task must be 1 day",
    )
    .refine(
        (val) => (val.eventType === "activity" ? val.duration >= 1 : true),
        "Duration for an activity must be at least 1 day",
    );

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
