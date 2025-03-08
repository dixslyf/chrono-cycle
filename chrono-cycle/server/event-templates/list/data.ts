import * as E from "fp-ts/Either";
import { z } from "zod";

import {
    DoesNotExistError,
    InternalError,
    ValidationError,
} from "@/server/common/errors";
import { EventTemplate } from "@/server/common/data";
import { encodedIdSchema } from "@/server/common/identifiers";

export const listFormDataSchema = z.object({
    projectTemplateId: encodedIdSchema,
});

export type ListFormData = z.output<typeof listFormDataSchema>;

export type ListError =
    | ValidationError<"projectTemplateId">
    | DoesNotExistError
    | InternalError;

export type ListResult = E.Either<ListError, EventTemplate[]>;
