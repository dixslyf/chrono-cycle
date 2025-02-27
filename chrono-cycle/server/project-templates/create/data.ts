import * as E from "fp-ts/Either";

import { z } from "zod";

import { ProjectTemplateOverview } from "../common/data";
import { AuthenticationError, ValidationError } from "@/server/common/errors";

export const nameSchema = z
    .string()
    .nonempty("Please enter a name for the project template.");

export const descriptionSchema = z.string();

export const createFormSchema = z.object({
    name: nameSchema,
    description: descriptionSchema,
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
    | AuthenticationError
    | DuplicateNameError;

export type CreateResult = E.Either<CreateError, CreateReturnData>;
