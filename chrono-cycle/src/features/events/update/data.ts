import * as E from "fp-ts/Either";
import { z } from "zod";

import { Event } from "@/common/data/domain";
import {
    DoesNotExistError,
    DuplicateNameError,
    InternalError,
    ValidationError,
} from "@/common/errors";

import { encodedIdSchema } from "@/lib/identifiers";

import { expandedEventUpdateSchema, reminderInsertSchema } from "@/db/schema";

export const payloadSchema = z.object({
    id: encodedIdSchema,
    name: expandedEventUpdateSchema.shape.name,
    offsetDays: expandedEventUpdateSchema.shape.offsetDays,
    duration: expandedEventUpdateSchema.shape.duration,
    note: expandedEventUpdateSchema.shape.note,
    eventType: expandedEventUpdateSchema.shape.eventType,
    autoReschedule: expandedEventUpdateSchema.shape.autoReschedule,
    status: expandedEventUpdateSchema.shape.status,
    notificationsEnabled: expandedEventUpdateSchema.shape.notificationsEnabled,
    remindersDelete: z.array(encodedIdSchema),
    remindersInsert: z.array(
        z.object({
            daysBeforeEvent: reminderInsertSchema.shape.daysBeforeEvent,
            time: reminderInsertSchema.shape.time,
            emailNotifications: reminderInsertSchema.shape.emailNotifications,
            desktopNotifications:
                reminderInsertSchema.shape.desktopNotifications,
        }),
    ),
    remindersUpdate: z.array(
        expandedEventUpdateSchema.shape.remindersUpdate.element.setKey(
            "id",
            encodedIdSchema,
        ),
    ),
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
          | "eventType"
          | "autoReschedule"
          | "status"
          | "notificationsEnabled"
          | "remindersDelete"
          | "remindersInsert"
          | "remindersUpdate"
      >
    | DoesNotExistError
    | DuplicateNameError
    | InternalError;

export type Result = E.Either<Failure, Event>;
