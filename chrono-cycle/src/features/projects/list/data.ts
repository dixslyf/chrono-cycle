import * as E from "fp-ts/Either";
import { z } from "zod";

import { ProjectOverview } from "@/common/data/domain";
import { InternalError, ValidationError } from "@/common/errors";

import { encodedIdSchema } from "@/lib/identifiers";

export const payloadSchema = z.object({
    projectTemplateId: encodedIdSchema,
});

export type Payload = z.input<typeof payloadSchema>;
export type ParsedPayload = z.output<typeof payloadSchema>;

export type Failure = ValidationError<"projectTemplateId"> | InternalError;

export type Result = E.Either<Failure, ProjectOverview[]>;
