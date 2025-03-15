import * as E from "fp-ts/Either";
import { z } from "zod";

import { ProjectOverview } from "@/common/data/domain";
import {
    DoesNotExistError,
    DuplicateNameError,
    InternalError,
    ValidationError,
} from "@/common/errors";

import { encodedIdSchema } from "@/lib/identifiers";

import { projectUpdateSchema } from "@/db/schema";

export const payloadSchema = z.object({
    id: encodedIdSchema,
    name: projectUpdateSchema.shape.name,
    description: projectUpdateSchema.shape.description,
    startsAt: z.string().date().pipe(z.coerce.date()).optional(),
});

export type Payload = z.input<typeof payloadSchema>;
export type ParsedPayload = z.output<typeof payloadSchema>;

export type Failure =
    | ValidationError<"id" | "name" | "description" | "startsAt">
    | DoesNotExistError
    | DuplicateNameError
    | InternalError;

export type Result = E.Either<Failure, ProjectOverview>;
