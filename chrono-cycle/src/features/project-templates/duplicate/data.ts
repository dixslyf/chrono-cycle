import * as E from "fp-ts/Either";
import { z } from "zod";

import { ProjectTemplate } from "@/common/data/domain";
import {
    DoesNotExistError,
    DuplicateNameError,
    InternalError,
    ValidationError,
} from "@/common/errors";

import { payloadSchema as createPtPayloadSchema } from "@/features/project-templates/create/data";

import { encodedIdSchema } from "@/lib/identifiers";

export const payloadSchema = z
    .object({
        projectTemplateId: encodedIdSchema,
    })
    .merge(createPtPayloadSchema);

export type Payload = z.input<typeof payloadSchema>;
export type ParsedPayload = z.output<typeof payloadSchema>;

export type Failure =
    | ValidationError<"projectTemplateId" | "name" | "description">
    | DoesNotExistError
    | DuplicateNameError
    | InternalError;

export type Result = E.Either<Failure, ProjectTemplate>;
