import * as E from "fp-ts/Either";
import { ProjectOverview } from "@/server/common/data";
import { InternalError, ValidationError } from "@/server/common/errors";
import { z } from "zod";
import { encodedIdSchema } from "@/server/common/identifiers";

export const listProjectsDataSchema = z.object({
    projectTemplateId: encodedIdSchema,
});

export type ListData = z.output<typeof listProjectsDataSchema>;

export type ListError = ValidationError<"projectTemplateId"> | InternalError;

export type ListResult = E.Either<ListError, ProjectOverview[]>;
