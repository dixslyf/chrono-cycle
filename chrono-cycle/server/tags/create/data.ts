import * as E from "fp-ts/Either";

import { InternalError, ValidationError } from "@/server/common/errors";
import { Tag } from "@/server/common/data";

export type TagExistsError = {
    _errorKind: "TagExistsError";
};

export function TagExistsError(): TagExistsError {
    return { _errorKind: "TagExistsError" };
}

export type CreateError =
    | ValidationError<"name">
    | TagExistsError
    | InternalError;

export type CreateResult = E.Either<CreateError, Tag>;
