import { and, eq } from "drizzle-orm";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { DuplicateNameError } from "@/common/errors";

import { DbLike } from "@/db";
import { projects as projectsTable } from "@/db/schema";

export function checkDuplicateProjectName(
    db: DbLike,
    userId: number,
    name: string,
): TE.TaskEither<DuplicateNameError, void> {
    return pipe(
        TE.fromTask(() =>
            db
                .select()
                .from(projectsTable)
                .where(
                    and(
                        eq(projectsTable.userId, userId),
                        eq(projectsTable.name, name),
                    ),
                ),
        ),
        TE.chain((selected) => {
            if (selected.length > 0) {
                return TE.left(DuplicateNameError());
            }

            return TE.right(undefined);
        }),
    );
}
