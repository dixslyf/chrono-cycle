import * as E from "fp-ts/Either";

import { z } from "zod";
import { ProjectTemplateBasicInfo } from "../list/data";

import { AuthenticationError, ValidationError } from "@/server/common/errors";

export const nameSchema = z
    .string()
    .nonempty("Please enter a name for the project template.");

export const descriptionSchema = z.string();

export const formSchema = z.object({
    name: nameSchema,
    description: descriptionSchema,
});

export type CreateFormData = z.output<typeof formSchema>;

export type DuplicateNameError = {
    _errorKind: "DuplicateNameError";
};

export function DuplicateNameError(): DuplicateNameError {
    return { _errorKind: "DuplicateNameError" };
}

export type CreateError =
    | ValidationError<"name" | "description">
    | AuthenticationError
    | DuplicateNameError;

export type CreateResult = E.Either<CreateError, ProjectTemplateBasicInfo>;
