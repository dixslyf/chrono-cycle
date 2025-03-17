import * as E from "fp-ts/Either";

import { Project } from "@/common/data/domain";
import { InternalError } from "@/common/errors";

export type Failure = InternalError;
export type Result = E.Either<Failure, Project[]>;
