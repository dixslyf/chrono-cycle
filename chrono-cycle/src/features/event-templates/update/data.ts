import * as E from "fp-ts/Either";
import { z } from "zod";

import { EventTemplate, tagNameSchema } from "@/common/data/domain";
import {
    DoesNotExistError,
    DuplicateNameError,
    InternalError,
    ValidationError,
} from "@/common/errors";

import { payloadSchema as reminderTemplateCreatePayloadSchema } from "@/features/reminder-templates/create/data";

import { encodedIdSchema } from "@/lib/identifiers";

import { expandedEventTemplateUpdateSchema } from "@/db/schema";

export const payloadSchema = z.object({
    id: encodedIdSchema,
    name: expandedEventTemplateUpdateSchema.shape.name,
    offsetDays: expandedEventTemplateUpdateSchema.shape.offsetDays,
    duration: expandedEventTemplateUpdateSchema.shape.duration,
    note: expandedEventTemplateUpdateSchema.shape.note,
    autoReschedule: expandedEventTemplateUpdateSchema.shape.autoReschedule,
    remindersDelete: z.array(encodedIdSchema).optional(),
    remindersInsert: z
        .array(
            reminderTemplateCreatePayloadSchema.omit({
                eventTemplateId: true,
            }),
        )
        .optional(),
    remindersUpdate: z
        .array(
            expandedEventTemplateUpdateSchema.shape.remindersUpdate.element.extend(
                {
                    id: encodedIdSchema,
                },
            ),
        )
        .optional(),
    tags: z.array(tagNameSchema).optional(),
});

export type Payload = z.input<typeof payloadSchema>;
export type ParsedPayload = z.output<typeof payloadSchema>;

export type Failure =
    | ValidationError<
          | "id"
          | "name"
          | "offsetDays"
          | "duration"
          | "note"
          | "autoReschedule"
          | "remindersDelete"
          | "remindersInsert"
          | "remindersUpdate"
          | "tags"
      >
    | DoesNotExistError
    | DuplicateNameError
    | InternalError;

export type Result = E.Either<Failure, EventTemplate>;
