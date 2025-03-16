import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { ProjectOverview, toProjectOverview } from "@/common/data/domain";
import { DoesNotExistError, DuplicateNameError } from "@/common/errors";

import { decodeProjectId } from "@/lib/identifiers";

import { getDb } from "@/db";
import { updateProject } from "@/db/queries/projects/update";

import { ParsedPayload } from "./data";

export function bridge(
    userId: number,
    payloadP: ParsedPayload,
): TE.TaskEither<DoesNotExistError | DuplicateNameError, ProjectOverview> {
    return pipe(
        TE.fromTask(getDb),
        TE.chain((db) => {
            const { id, ...rest } = payloadP;
            return updateProject(db, userId, {
                id: decodeProjectId(id),
                ...rest,
            });
        }),
        TE.map(toProjectOverview),
    );
}
