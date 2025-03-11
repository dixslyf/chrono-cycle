import * as E from "fp-ts/Either";

import { ProjectTemplateOverview } from "@common/data/domain";
import { InternalError } from "@common/errors";

export type Failure = InternalError;

export type Result = E.Either<Failure, ProjectTemplateOverview[]>;
