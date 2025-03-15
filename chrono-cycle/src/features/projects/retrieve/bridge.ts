import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";

import { Project, toProject } from "@/common/data/domain";
import { AssertionError, DoesNotExistError } from "@/common/errors";

import { decodeProjectId } from "@/lib/identifiers";

import getDb from "@/db";
import { retrieveExpandedProject } from "@/db/queries/projects/retrieveExpanded";

import { ParsedPayload } from "./data";

export function bridge(
    userId: number,
    payloadP: ParsedPayload,
): TE.TaskEither<AssertionError | DoesNotExistError, Project> {
    return pipe(
        TE.fromTask(getDb),
        TE.chain((db) =>
            retrieveExpandedProject(
                db,
                userId,
                decodeProjectId(payloadP.projectId),
            ),
        ),
        TE.map(toProject),
    );
}
