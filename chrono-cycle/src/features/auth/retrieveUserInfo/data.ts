import * as E from "fp-ts/Either";

import { User } from "@/common/data/userSession";
import { InternalError } from "@/common/errors";

export type Failure = InternalError;
export type Result = E.Either<Failure, User>;
