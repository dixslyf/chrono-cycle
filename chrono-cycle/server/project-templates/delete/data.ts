import * as E from "fp-ts/Either";
import { AuthenticationError } from "@/server/common/errors";

export type DoesNotExistError = {
    _errorKind: "DoesNotExistError";
};

export type DeleteError = AuthenticationError | DoesNotExistError;

export type DeleteResult = E.Either<DeleteError, {}>;
