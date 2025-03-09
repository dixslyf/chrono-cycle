import * as E from "fp-ts/Either";
import {
    DoesNotExistError,
    InternalError,
    ValidationError,
} from "@/server/common/errors";
import { z } from "zod";
import { encodedIdSchema } from "@/server/common/identifiers";

export const deleteProjectDataSchema = z.object({
    projectId: encodedIdSchema,
});

export type DeleteProjectData = z.output<typeof deleteProjectDataSchema>;

export type DeleteProjectError =
    | ValidationError<"projectId">
    | DoesNotExistError
    | InternalError;

export type DeleteProjectResult = E.Either<DeleteProjectError, void>;
