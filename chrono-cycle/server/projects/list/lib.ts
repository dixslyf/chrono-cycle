import { eq, and } from "drizzle-orm";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";

import getDb from "@/server/db";
import {
    decodeProjectTemplateId,
    encodeProjectId,
    encodeProjectTemplateId,
} from "@/server/common/identifiers";
import { ProjectOverview } from "@/server/common/data";
import { projects as projectsTable } from "@/server/db/schema";
import { ListError, ListResult } from "./data";
import { InternalError } from "@/server/common/errors";

export async function listProjects(
    userId: number,
    projectTemplateId: string,
): Promise<ListResult> {
    const db = await getDb();

    const task = pipe(
        TE.tryCatch(
            async () =>
                await db
                    .select()
                    .from(projectsTable)
                    .where(
                        and(
                            eq(projectsTable.userId, userId),
                            eq(
                                projectsTable.projectTemplateId,
                                decodeProjectTemplateId(projectTemplateId),
                            ),
                        ),
                    ),
            (_err) =>
                InternalError(
                    "An internal error occurred",
                ) satisfies ListError as ListError,
        ),
        TE.map((selected) =>
            selected.map((proj) => {
                const { id, projectTemplateId, ...rest } = proj;
                return {
                    id: encodeProjectId(id),
                    projectTemplateId: projectTemplateId
                        ? encodeProjectTemplateId(projectTemplateId)
                        : null,
                    ...rest,
                } satisfies ProjectOverview;
            }),
        ),
    );

    return task();
}
