import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";

import { Project, toProject } from "@/common/data/domain";
import {
    AssertionError,
    DoesNotExistError,
    DuplicateNameError,
} from "@/common/errors";

import { decodeProjectTemplateId } from "@/lib/identifiers";

import { getDb } from "@/db";
import { createProject } from "@/db/queries/projects/create";

import { ParsedPayload } from "./data";

export function bridge(
    userId: number,
    payloadP: ParsedPayload,
): TE.TaskEither<
    DuplicateNameError | AssertionError | DoesNotExistError,
    Project
> {
    return pipe(
        TE.fromTask(getDb),
        TE.chain((db) => {
            const { projectTemplateId, ...rest } = payloadP;
            return createProject(db, {
                userId,
                projectTemplateId: decodeProjectTemplateId(projectTemplateId),
                ...rest,
            });
        }),
        TE.map(toProject),
    );
}
