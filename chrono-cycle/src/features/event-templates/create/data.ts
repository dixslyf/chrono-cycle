import * as E from "fp-ts/Either";
import { z } from "zod";

import { EventTemplate, tagNameSchema } from "@/common/data/domain";
import {
    DoesNotExistError,
    InternalError,
    TagExistsError,
    ValidationError,
} from "@/common/errors";

import { payloadSchema as createReminderTemplatePayloadSchema } from "@/features/reminder-templates/create/data";

import { encodedIdSchema } from "@/lib/identifiers";

import { eventTemplateInsertSchema } from "@/db/schema";

export const payloadSchema = z
    .object({
        name: eventTemplateInsertSchema.shape.name,
        offsetDays: eventTemplateInsertSchema.shape.offsetDays,
        duration: eventTemplateInsertSchema.shape.duration,
        note: eventTemplateInsertSchema.shape.note,
        eventType: eventTemplateInsertSchema.shape.eventType,
        autoReschedule: eventTemplateInsertSchema.shape.autoReschedule,
        projectTemplateId: encodedIdSchema, // Sqid, not the actual ID.
        reminders: z.array(
            createReminderTemplatePayloadSchema.omit({ eventTemplateId: true }),
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

export type Payload = z.input<typeof payloadSchema>;
export type ParsedPayload = z.output<typeof payloadSchema>;

export type Failure =
    | ValidationError<
          | "name"
          | "offsetDays"
          | "duration"
          | "note"
          | "eventType"
          | "autoReschedule"
          | "projectTemplateId"
          | "reminders"
          | "tags"
      >
    | DoesNotExistError
    | TagExistsError
    | InternalError;

export type Result = E.Either<Failure, EventTemplate>;
