import { Tag } from "@/server/common/data";
import { InternalError, ValidationError } from "@/server/common/errors";
import * as E from "fp-ts/Either";

export type CreateError =
    | ValidationError<"name">
    | TagExistsError
    | InternalError;

export type CreateResult = E.Either<CreateError, Tag>;
