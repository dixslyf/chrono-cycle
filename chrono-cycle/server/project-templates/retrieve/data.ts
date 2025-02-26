import { AuthenticationError, DoesNotExistError } from "@/server/common/errors";
import * as E from "fp-ts/Either";

export type ProjectTemplateData = {
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    // TODO: Add more in the future (e.g., event data).
};

export type RetrieveError = AuthenticationError | DoesNotExistError;

export type RetrieveResult = E.Either<RetrieveError, ProjectTemplateData>;
