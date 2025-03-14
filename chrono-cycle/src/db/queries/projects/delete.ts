import { and, eq } from "drizzle-orm";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { AssertionError, DoesNotExistError } from "@/common/errors";

import { DbLike } from "@/db";
import { projects as projectsTable } from "@/db/schema";

export function deleteProject(
    db: DbLike,
    userId: number,
    projectId: number,
): TE.TaskEither<AssertionError | DoesNotExistError, void> {
    return pipe(
        TE.fromTask(
            async () =>
                await db
                    .delete(projectsTable)
                    .where(
                        and(
                            eq(projectsTable.id, projectId),
                            eq(projectsTable.userId, userId),
                        ),
                    )
                    .returning(),
        ),
        TE.chain((deleted) => {
            if (deleted.length === 0) {
                return TE.left(
                    DoesNotExistError() as AssertionError | DoesNotExistError,
                );
            }

            if (deleted.length > 1) {
                return TE.left(
                    AssertionError("Unexpected deletion of multiple projects"),
                );
            }

            return TE.right(undefined);
        }),
    );
}
