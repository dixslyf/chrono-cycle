import * as E from "fp-ts/Either";

import { InternalError, ValidationError } from "@/server/common/errors";
import { Tag } from "@/server/common/data";

export type CreateError =
    | ValidationError<"name">
    | TagExistsError
    | InternalError;

export type CreateResult = E.Either<CreateError, Tag>;
