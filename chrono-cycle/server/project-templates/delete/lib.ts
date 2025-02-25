import { and, eq } from "drizzle-orm";

import getDb from "@/server/db";
import { projectTemplates as projectTemplatesTable } from "@/server/db/schema/projectTemplates";
import { ProjectTemplateBasicInfo } from "@/server/project-templates/list/data";

export async function deleteProjectTemplate(
    projectTemplateName: string,
    userId: number,
): Promise<ProjectTemplateBasicInfo | null> {
    const db = await getDb();
    const deleted = await db
        .delete(projectTemplatesTable)
        .where(
            and(
                eq(projectTemplatesTable.name, projectTemplateName),
                eq(projectTemplatesTable.userId, userId),
            ),
        )
        .returning();

    if (deleted.length === 0) {
        return null;
    }

    return {
        name: deleted[0].name,
        description: deleted[0].description,
        createdAt: deleted[0].createdAt,
        updatedAt: deleted[0].updatedAt,
    };
}
