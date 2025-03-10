import {
    DoesNotExistError,
    InternalError,
    ValidationError,
} from "@/server/common/errors";
import { encodedIdSchema } from "@/server/common/identifiers";
import * as E from "fp-ts/Either";
import { z } from "zod";

export const deleteReminderTemplatesDataSchema = z.object({
    reminderTemplateIds: z.array(encodedIdSchema),
});

export type DeleteReminderTemplateData = z.output<
    typeof deleteReminderTemplatesDataSchema
>;

export type DeleteReminderTemplatesError =
    | ValidationError<"reminderTemplateIds">
    | DoesNotExistError
    | InternalError;

export type DeleteReminderTemplatesResult = E.Either<
    DeleteReminderTemplatesError,
    void
>;
