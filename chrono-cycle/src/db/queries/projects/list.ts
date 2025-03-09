import { and, eq } from "drizzle-orm";

import { DbLike } from "@db";
import { DbProject, projects as projectsTable } from "@db/schema";

export async function listProjects(
    db: DbLike,
    userId: number,
    projectTemplateId: number,
): Promise<DbProject[]> {
    return await db
        .select()
        .from(projectsTable)
        .where(
            and(
                eq(projectsTable.userId, userId),
                eq(projectsTable.projectTemplateId, projectTemplateId),
            ),
        );
}
