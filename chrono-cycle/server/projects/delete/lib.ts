import { and, eq } from "drizzle-orm";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";

import getDb from "@/server/db";
import { decodeProjectId } from "@/server/common/identifiers";
import { projects as projectsTable } from "@/server/db/schema";
import { DoesNotExistError, InternalError } from "@/server/common/errors";
import { serverActionLogger } from "@/server/log";
import { DeleteProjectError, DeleteProjectResult } from "./data";

export async function deleteProject(
    userId: number,
    projectEncodedId: string,
): Promise<DeleteProjectResult> {
    const projectId = decodeProjectId(projectEncodedId);

    const db = await getDb();
    const task = pipe(
        TE.tryCatch(
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
            (err) => {
                serverActionLogger.error(String(err));
                return InternalError() satisfies DeleteProjectError as DeleteProjectError;
            },
        ),
        TE.chain((deleted) => {
            if (deleted.length === 0) {
                return TE.left(DoesNotExistError());
            }

            if (deleted.length > 1) {
                return TE.left(
                    InternalError() satisfies DeleteProjectError as DeleteProjectError,
                );
            }

            return TE.right(undefined);
        }),
    );

    return task();
}
