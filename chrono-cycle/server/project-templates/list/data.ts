import { AuthenticationError } from "@/server/common/errors";
import * as E from "fp-ts/Either";

export type ProjectTemplateBasicInfo = {
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
};

export type ListError = AuthenticationError;

export type ListResult = E.Either<ListError, ProjectTemplateBasicInfo[]>;
