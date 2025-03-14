import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";

import { ProjectTemplate, toProjectTemplate } from "@/common/data/domain";
import { AssertionError, DoesNotExistError } from "@/common/errors";

import { decodeProjectTemplateId } from "@/lib/identifiers";

import getDb from "@/db";
import { retrieveExpandedProjectTemplate } from "@/db/queries/project-templates/retrieve";

import { ParsedPayload } from "./data";

export function bridge(
    userId: number,
    payloadP: ParsedPayload,
): TE.TaskEither<AssertionError | DoesNotExistError, ProjectTemplate> {
    return pipe(
        TE.fromTask(getDb),
        TE.chain((db) =>
            retrieveExpandedProjectTemplate(
                db,
                userId,
                decodeProjectTemplateId(payloadP.projectTemplateId),
            ),
        ),
        TE.map(toProjectTemplate),
    );
}
