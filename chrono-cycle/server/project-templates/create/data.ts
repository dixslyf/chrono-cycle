import * as E from "fp-ts/Either";

import { z } from "zod";

import { ProjectTemplateOverview } from "@/server/common/data";
import { ValidationError } from "@/server/common/errors";
import { projectTemplateInsertSchema } from "@/server/db/schema/projectTemplates";

export const createFormSchema = z.object({
    name: projectTemplateInsertSchema.shape.name,
    description: projectTemplateInsertSchema.shape.description,
});

export type CreateFormData = z.output<typeof createFormSchema>;

export type DuplicateNameError = {
    _errorKind: "DuplicateNameError";
};

export function DuplicateNameError(): DuplicateNameError {
    return { _errorKind: "DuplicateNameError" };
}

export type CreateReturnData = ProjectTemplateOverview;

export type CreateError =
    | ValidationError<"name" | "description">
    | DuplicateNameError;

export type CreateResult = E.Either<CreateError, CreateReturnData>;
