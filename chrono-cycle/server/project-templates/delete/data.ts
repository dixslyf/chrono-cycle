import * as E from "fp-ts/Either";
import { AuthenticationError, DoesNotExistError } from "@/server/common/errors";

export type DeleteError = AuthenticationError | DoesNotExistError;

export type DeleteResult = E.Either<DeleteError, {}>;
