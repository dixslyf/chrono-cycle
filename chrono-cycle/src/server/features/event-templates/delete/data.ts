import {
    DoesNotExistError,
    InternalError,
    ValidationError,
} from "@/server/common/errors";
import { encodedIdSchema } from "@/server/common/identifiers";
import * as E from "fp-ts/Either";
import { z } from "zod";

export const deleteEventTemplatesDataSchema = z.object({
    eventTemplateIds: z.array(encodedIdSchema),
});

export type DeleteEventTemplateData = z.output<
    typeof deleteEventTemplatesDataSchema
>;

export type DeleteEventTemplatesError =
    | ValidationError<"eventTemplateIds">
    | DoesNotExistError
    | InternalError;

export type DeleteEventTemplatesResult = E.Either<
    DeleteEventTemplatesError,
    void
>;
