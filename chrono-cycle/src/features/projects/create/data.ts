import * as E from "fp-ts/Either";
import { z } from "zod";

import { Project } from "@common/data/domain";
import {
    DoesNotExistError,
    DuplicateNameError,
    InternalError,
    ValidationError,
} from "@common/errors";

import { encodedIdSchema } from "@lib/identifiers";

import { projectInsertSchema } from "@db/schema";

export const payloadSchema = z.object({
    name: projectInsertSchema.shape.name,
    description: projectInsertSchema.shape.description,
    startsAt: z.string().date().pipe(z.coerce.date()),
    projectTemplateId: encodedIdSchema,
});

export type Payload = z.input<typeof payloadSchema>;
export type ParsedPayload = z.output<typeof payloadSchema>;

export type Failure =
    | ValidationError<"name" | "description" | "startsAt" | "projectTemplateId">
    | DuplicateNameError
    | DoesNotExistError
    | InternalError;

export type Result = E.Either<Failure, Project>;
