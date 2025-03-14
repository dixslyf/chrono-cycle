import * as E from "fp-ts/Either";
import { z } from "zod";

import { ProjectTemplateOverview } from "@/common/data/domain";
import {
    DuplicateNameError,
    InternalError,
    ValidationError,
} from "@/common/errors";

import { projectTemplateInsertSchema } from "@/db/schema";

export const payloadSchema = z.object({
    name: projectTemplateInsertSchema.shape.name,
    description: projectTemplateInsertSchema.shape.description,
});

export type Payload = z.input<typeof payloadSchema>;
export type ParsedPayload = z.output<typeof payloadSchema>;

export type Failure =
    | ValidationError<"name" | "description">
    | DuplicateNameError
    | InternalError;

export type Result = E.Either<Failure, ProjectTemplateOverview>;
