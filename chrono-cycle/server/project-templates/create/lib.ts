import { and, eq } from "drizzle-orm";

import getDb from "@/server/db";
import {
    ProjectTemplate,
    projectTemplates as projectTemplatesTable,
} from "@/server/db/schema/projectTemplates";

export async function insertProjectTemplateDb(
    name: string,
    description: string,
    userId: number,
): Promise<ProjectTemplate> {
    const db = await getDb();
    const inserted = await db
        .insert(projectTemplatesTable)
        .values({ name, description, userId })
        .returning();
    return inserted[0];
}

export async function isDuplicateProjectTemplateName(
    name: string,
    userId: number,
): Promise<boolean> {
    const db = await getDb();
    const selected = await db
        .select()
        .from(projectTemplatesTable)
        .where(
            and(
                eq(projectTemplatesTable.userId, userId),
                eq(projectTemplatesTable.name, name),
            ),
        );
    return selected.length > 0;
}
