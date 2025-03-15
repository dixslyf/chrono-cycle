import { eq } from "drizzle-orm";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { DoesNotExistError, DuplicateNameError } from "@/common/errors";

import { DbLike } from "@/db";
import {
    DbProject,
    DbProjectUpdate,
    projects as projectsTable,
} from "@/db/schema";

import { checkDuplicateProjectName } from "./checkDuplicateName";

function rawUpdateProject(
    db: DbLike,
    data: DbProjectUpdate,
): TE.TaskEither<DoesNotExistError, DbProject> {
    const task = pipe(
        TE.fromTask(() =>
            db
                .update(projectsTable)
                .set({ updatedAt: new Date(), ...data })
                .where(eq(projectsTable.id, data.id))
                .returning(),
        ),
        TE.chain((updated) =>
            updated.length === 0
                ? TE.left(DoesNotExistError())
                : TE.right(updated[0]),
        ),
    );

    return task;
}

export function updateProject(
    db: DbLike,
    userId: number,
    data: DbProjectUpdate,
): TE.TaskEither<DoesNotExistError | DuplicateNameError, DbProject> {
    const task = pipe(
        data.name
            ? checkDuplicateProjectName(db, userId, data.name)
            : TE.right(undefined),
        TE.chain<DoesNotExistError | DuplicateNameError, void, DbProject>(() =>
            rawUpdateProject(db, data),
        ),
    );

    return task;
}
