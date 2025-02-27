import { eq } from "drizzle-orm";

import getDb from "@/server/db";
import { projectTemplates as projectTemplatesTable } from "@/server/db/schema/projectTemplates";
import { ProjectTemplateOverview } from "../common/data";

export async function getProjectTemplatesForUser(
    userId: number,
): Promise<ProjectTemplateOverview[]> {
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
