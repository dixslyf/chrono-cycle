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

import {
    rawEventTemplateInsertSchema,
    refineRawEventTemplateInsertSchema,
} from "@/db/schema";

export const payloadSchema = refineRawEventTemplateInsertSchema(
    z.object({
        name: rawEventTemplateInsertSchema.shape.name,
        offsetDays: rawEventTemplateInsertSchema.shape.offsetDays,
        duration: rawEventTemplateInsertSchema.shape.duration,
        note: rawEventTemplateInsertSchema.shape.note,
        eventType: rawEventTemplateInsertSchema.shape.eventType,
        autoReschedule: rawEventTemplateInsertSchema.shape.autoReschedule,
        projectTemplateId: encodedIdSchema, // Sqid, not the actual ID.
        reminders: z.array(
            createReminderTemplatePayloadSchema.omit({ eventTemplateId: true }),
        ),
        tags: z.array(tagNameSchema),
    }),
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
