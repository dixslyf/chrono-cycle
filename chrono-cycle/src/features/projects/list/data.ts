import { ProjectOverview } from "@/server/common/data";
import { InternalError, ValidationError } from "@/server/common/errors";
import { encodedIdSchema } from "@/server/common/identifiers";
import * as E from "fp-ts/Either";
import { z } from "zod";

export const listProjectsDataSchema = z.object({
    projectTemplateId: encodedIdSchema,
});

export type ListData = z.output<typeof listProjectsDataSchema>;

export type ListError = ValidationError<"projectTemplateId"> | InternalError;

export type ListResult = E.Either<ListError, ProjectOverview[]>;
