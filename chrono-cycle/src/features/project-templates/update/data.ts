import * as E from "fp-ts/Either";
import { z } from "zod";

import { ProjectTemplateOverview } from "@/common/data/domain";
import {
    DoesNotExistError,
    DuplicateNameError,
    InternalError,
    ValidationError,
} from "@/common/errors";

import { encodedIdSchema } from "@/lib/identifiers";

import { projectTemplateUpdateSchema } from "@/db/schema";

export const payloadSchema = z.object({
    id: encodedIdSchema,
    name: projectTemplateUpdateSchema.shape.name,
    description: projectTemplateUpdateSchema.shape.description,
});

export type Payload = z.input<typeof payloadSchema>;
export type ParsedPayload = z.output<typeof payloadSchema>;

export type Failure =
    | ValidationError<"id" | "name" | "description">
    | DoesNotExistError
    | DuplicateNameError
    | InternalError;

export type Result = E.Either<Failure, ProjectTemplateOverview>;
