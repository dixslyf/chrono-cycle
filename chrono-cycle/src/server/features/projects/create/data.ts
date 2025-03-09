import * as E from "fp-ts/Either";

import { z } from "zod";

import { Project } from "@/server/common/data";
import {
    DuplicateNameError,
    InternalError,
    ValidationError,
} from "@/server/common/errors";
import { projectInsertSchema } from "@/server/db/schema";
import { encodedIdSchema } from "@/server/common/identifiers";
import { ListError as ListEventTemplatesError } from "@/server/features/event-templates/list/data";

export const createFormSchema = z.object({
    name: projectInsertSchema.shape.name,
    description: projectInsertSchema.shape.description,
    startsAt: projectInsertSchema.shape.startsAt,
    projectTemplateId: encodedIdSchema,
});

export type CreateFormData = z.output<typeof createFormSchema>;

export type CreateError =
    | ValidationError<"name" | "description" | "startsAt" | "projectTemplateId">
    | DuplicateNameError
    | ListEventTemplatesError
    | InternalError;

export type CreateResult = E.Either<CreateError, Project>;
