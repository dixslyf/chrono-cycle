import * as E from "fp-ts/Either";
import { DoesNotExistError } from "@/server/common/errors";

export type DeleteError = DoesNotExistError;

export type DeleteResult = E.Either<DeleteError, {}>;
