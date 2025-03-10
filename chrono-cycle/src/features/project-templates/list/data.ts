import { ProjectTemplateOverview } from "@/server/common/data";
import * as E from "fp-ts/Either";

export type ListReturnData = ProjectTemplateOverview;

export type ListError = void;

export type ListResult = E.Either<ListError, ListReturnData[]>;
