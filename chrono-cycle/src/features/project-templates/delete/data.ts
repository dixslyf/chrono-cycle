import { DoesNotExistError } from "@/server/common/errors";
import * as E from "fp-ts/Either";

export type DeleteError = DoesNotExistError;

export type DeleteResult = E.Either<DeleteError, {}>;
