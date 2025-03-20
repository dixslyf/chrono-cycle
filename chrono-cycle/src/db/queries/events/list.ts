import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { AssertionError, DoesNotExistError } from "@/common/errors";

import { DbLike } from "@/db";
import { retrieveProject } from "@/db/queries/projects/retrieve";
import { DbExpandedEvent } from "@/db/schema/events";

import { retrieveExpandedEventsByProjectId } from "./retrieveExpanded";

export function listEvents(
    db: DbLike,
    userId: number,
    projectId: number,
): TE.TaskEither<AssertionError | DoesNotExistError, DbExpandedEvent[]> {
    return pipe(
        // Check that the project exists.
        retrieveProject(db, userId, projectId),
        TE.chain(() =>
            TE.fromTask(() => retrieveExpandedEventsByProjectId(db, projectId)),
        ),
    );
}
