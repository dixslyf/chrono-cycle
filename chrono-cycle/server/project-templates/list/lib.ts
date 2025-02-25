import { eq } from "drizzle-orm";

import getDb from "@/server/db";
import { projectTemplates as projectTemplatesTable } from "@/server/db/schema/projectTemplates";
import { ProjectTemplateBasicInfo } from "./data";

export async function getProjectTemplatesForUser(
    userId: number,
): Promise<ProjectTemplateBasicInfo[]> {
    const db = await getDb();
    const selected = await db
        .select()
        .from(projectTemplatesTable)
        .where(eq(projectTemplatesTable.userId, userId));

    return selected.map((row) => ({
        name: row.name,
        description: row.description,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    }));
}
