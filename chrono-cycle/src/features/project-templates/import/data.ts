import * as E from "fp-ts/Either";
import { z } from "zod";

import { ProjectTemplate } from "@/common/data/domain";
import {
    DoesNotExistError,
    DuplicateNameError,
    InternalError,
    TagExistsError,
    ValidationError,
} from "@/common/errors";

import { rawPayloadSchema as createEtPayloadSchema } from "@/features/event-templates/create/data";
import { payloadSchema as createPtPayloadSchema } from "@/features/project-templates/create/data";

import { refineRawEventTemplateInsertSchema } from "@/db/schema";

export const payloadSchema = createPtPayloadSchema.extend({
    events: z.array(
        refineRawEventTemplateInsertSchema(
            createEtPayloadSchema.omit({ projectTemplateId: true }),
        ),
    ),
});

export type Payload = z.input<typeof payloadSchema>;
export type ParsedPayload = z.output<typeof payloadSchema>;

export type Failure =
    | ValidationError<"name" | "description" | "events">
    | DuplicateNameError
    | DoesNotExistError
    | TagExistsError
    | InternalError;

export type Result = E.Either<Failure, ProjectTemplate>;
