import * as E from "fp-ts/Either";
import { z } from "zod";

import { ReminderTemplate } from "@/common/data/domain";
import {
    DoesNotExistError,
    DuplicateReminderError,
    InternalError,
    ValidationError,
} from "@/common/errors";

import { encodedIdSchema } from "@/lib/identifiers";

import { reminderTemplateInsertSchema } from "@/db/schema";

export const payloadSchema = z.object({
    eventTemplateId: encodedIdSchema,
    daysBeforeEvent: reminderTemplateInsertSchema.shape.daysBeforeEvent,
    time: reminderTemplateInsertSchema.shape.time,
    emailNotifications: reminderTemplateInsertSchema.shape.emailNotifications,
    desktopNotifications:
        reminderTemplateInsertSchema.shape.desktopNotifications,
});

export type Payload = z.input<typeof payloadSchema>;
export type ParsedPayload = z.output<typeof payloadSchema>;

export type Failure =
    | ValidationError<
          | "daysBeforeEvent"
          | "time"
          | "emailNotifications"
          | "desktopNotifications"
      >
    | DuplicateReminderError
    | DoesNotExistError
    | InternalError;

export type Result = E.Either<Failure, ReminderTemplate>;
