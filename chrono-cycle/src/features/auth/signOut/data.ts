import * as E from "fp-ts/Either";

import { DoesNotExistError, InternalError } from "@/common/errors";

export type Failure = DoesNotExistError | InternalError;

export type Result = E.Either<Failure, never>;
