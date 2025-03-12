import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";

import { AssertionError, DoesNotExistError } from "@common/errors";

import { decodeProjectId } from "@lib/identifiers";

import getDb from "@db";
import { deleteProject } from "@db/queries/projects/delete";

import { ParsedPayload } from "./data";

export function bridge(
    userId: number,
    payloadP: ParsedPayload,
): TE.TaskEither<AssertionError | DoesNotExistError, void> {
    return pipe(
        TE.fromTask(getDb),
        TE.chain((db) =>
            deleteProject(db, userId, decodeProjectId(payloadP.projectId)),
        ),
    );
}
