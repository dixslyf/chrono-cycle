import { eq, and } from "drizzle-orm";

import getDb from "@/server/db";
import { projectTemplates as projectTemplatesTable } from "@/server/db/schema/projectTemplates";
import { ProjectTemplateData } from "./data";

export async function retrieveProjectTemplate(
    projectTemplateName: string,
    userId: number,
): Promise<ProjectTemplateData | null> {
    const db = await getDb();
    const selected = await db
        .select()
        .from(projectTemplatesTable)
        .where(
            and(
                eq(projectTemplatesTable.name, projectTemplateName),
                eq(projectTemplatesTable.userId, userId),
            ),
        );

    if (selected.length <= 0) {
        return null;
    }

    return {
        name: selected[0].name,
        description: selected[0].description,
        createdAt: selected[0].createdAt,
        updatedAt: selected[0].updatedAt,
    };
}
