import { EventTemplate } from "@/server/common/data";
import {
    DoesNotExistError,
    InternalError,
    ValidationError,
} from "@/server/common/errors";
import { encodedIdSchema } from "@/server/common/identifiers";
import * as E from "fp-ts/Either";
import { z } from "zod";

export const listFormDataSchema = z.object({
    projectTemplateId: encodedIdSchema,
});

export type ListFormData = z.output<typeof listFormDataSchema>;

export type ListError =
    | ValidationError<"projectTemplateId">
    | DoesNotExistError
    | InternalError;

export type ListResult = E.Either<ListError, EventTemplate[]>;
