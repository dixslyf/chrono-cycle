import * as E from "fp-ts/Either";
import { z } from "zod";

import {
    DoesNotExistError,
    InternalError,
    ValidationError,
} from "@/common/errors";

import { encodedIdSchema } from "@/lib/identifiers";

export const payloadSchema = z.object({
    projectId: encodedIdSchema,
});

export type Payload = z.input<typeof payloadSchema>;
export type ParsedPayload = z.output<typeof payloadSchema>;

export type Failure =
    | ValidationError<"projectId">
    | DoesNotExistError
    | InternalError;

export type Result = E.Either<Failure, void>;
