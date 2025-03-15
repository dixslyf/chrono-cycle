import { and, eq } from "drizzle-orm";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { AssertionError, DoesNotExistError } from "@/common/errors";

import { DbLike } from "@/db";
import { DbProject, projects as projectsTable } from "@/db/schema";

export function retrieveProject(
    db: DbLike,
    userId: number,
    projectId: number,
): TE.TaskEither<AssertionError | DoesNotExistError, DbProject> {
    return pipe(
        TE.fromTask(() =>
            db
                .select()
                .from(projectsTable)
                .where(
                    and(
                        eq(projectsTable.id, projectId),
                        eq(projectsTable.userId, userId),
                    ),
                ),
        ),
        TE.chain((selected) => {
            if (selected.length < 1) {
                return TE.left(
                    DoesNotExistError() as DoesNotExistError | AssertionError,
                );
            }

            if (selected.length > 1) {
                return TE.left(
                    AssertionError("Unexpected multiple matching projects"),
                );
            }

            return TE.right(selected[0]);
        }),
    );
}
