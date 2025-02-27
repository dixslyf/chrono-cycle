import { AuthenticationError } from "@/server/common/errors";
import * as E from "fp-ts/Either";
import { ProjectTemplateOverview } from "../common/data";

export type ListReturnData = ProjectTemplateOverview;

export type ListError = AuthenticationError;

export type ListResult = E.Either<ListError, ListReturnData[]>;
