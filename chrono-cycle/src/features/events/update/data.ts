import * as E from "fp-ts/Either";
import { z } from "zod";

import { Event } from "@/common/data/domain";
import {
    DoesNotExistError,
    DuplicateNameError,
    InternalError,
    InvalidEventStatusError,
    ValidationError,
} from "@/common/errors";

import { encodedIdSchema } from "@/lib/identifiers";

import { expandedEventUpdateSchema, reminderInsertSchema } from "@/db/schema";

export const payloadSchema = z.object({
    id: encodedIdSchema,
    name: expandedEventUpdateSchema.shape.name,
    startDate: z.string().date().pipe(z.coerce.date()),
    duration: expandedEventUpdateSchema.shape.duration,
    note: expandedEventUpdateSchema.shape.note,
    autoReschedule: expandedEventUpdateSchema.shape.autoReschedule,
    status: expandedEventUpdateSchema.shape.status,
    notificationsEnabled: expandedEventUpdateSchema.shape.notificationsEnabled,
    remindersDelete: z.array(encodedIdSchema),
    remindersInsert: z.array(
        z.object({
            triggerTime: z
                .string()
                .datetime({ offset: true, local: false })
                .pipe(z.coerce.date()),
            emailNotifications: reminderInsertSchema.shape.emailNotifications,
            desktopNotifications:
                reminderInsertSchema.shape.desktopNotifications,
        }),
    ),
    remindersUpdate: z.array(
        expandedEventUpdateSchema.shape.remindersUpdate.element.extend({
            id: encodedIdSchema,
        }),
    ),
});

export type Payload = z.input<typeof payloadSchema>;
export type ParsedPayload = z.output<typeof payloadSchema>;

export type Failure =
    | ValidationError<
          | "id"
          | "name"
          | "startDate"
          | "duration"
          | "note"
          | "autoReschedule"
          | "status"
          | "notificationsEnabled"
          | "remindersDelete"
          | "remindersInsert"
          | "remindersUpdate"
      >
    | DoesNotExistError
    | DuplicateNameError
    | InvalidEventStatusError
    | InternalError;

export type Result = E.Either<Failure, Event>;
