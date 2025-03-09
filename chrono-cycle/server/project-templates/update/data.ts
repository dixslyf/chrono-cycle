import * as E from "fp-ts/Either";

import { z } from "zod";

import { ProjectTemplateOverview } from "@/server/common/data";
import {
    DoesNotExistError,
    DuplicateNameError,
    InternalError,
    ValidationError,
} from "@/server/common/errors";
import { projectTemplateUpdateSchema } from "@/server/db/schema/projectTemplates";
import { encodedIdSchema } from "@/server/common/identifiers";

export const updateDataSchema = z.object({
    id: encodedIdSchema,
    name: projectTemplateUpdateSchema.shape.name,
    description: projectTemplateUpdateSchema.shape.description,
});

export type UpdateData = z.output<typeof updateDataSchema>;

export type UpdateError =
    | InternalError
    | ValidationError<"id" | "name" | "description">
    | DoesNotExistError
    | DuplicateNameError;

export type UpdateResult = E.Either<UpdateError, ProjectTemplateOverview>;
