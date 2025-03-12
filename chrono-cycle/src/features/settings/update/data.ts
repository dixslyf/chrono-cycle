import * as E from "fp-ts/Either";
import { z } from "zod";

import { UserSettings } from "@common/data/userSession";
import {
    DoesNotExistError,
    InternalError,
    ValidationError,
} from "@common/errors";

import { userSettingsInsertSchema } from "@db/schema";

export const payloadSchema = z.object({
    startDayOfWeek: userSettingsInsertSchema.shape.startDayOfWeek,
    dateFormat: userSettingsInsertSchema.shape.dateFormat,
    enableEmailNotifications:
        userSettingsInsertSchema.shape.enableEmailNotifications,
    enableDesktopNotifications:
        userSettingsInsertSchema.shape.enableDesktopNotifications,
});

export type Payload = z.input<typeof payloadSchema>;
export type ParsedPayload = z.output<typeof payloadSchema>;

export type Failure =
    | ValidationError<
        | "startDayOfWeek"
        | "dateFormat"
        | "enableEmailNotifications"
        | "enableDesktopNotifications"
    >
    | DoesNotExistError
    | InternalError;

export type Result = E.Either<Failure, UserSettings>;
