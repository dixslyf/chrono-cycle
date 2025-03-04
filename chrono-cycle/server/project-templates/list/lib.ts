import { eq } from "drizzle-orm";

import getDb from "@/server/db";
import { projectTemplates as projectTemplatesTable } from "@/server/db/schema/projectTemplates";
import { ProjectTemplateOverview } from "@/server/common/data";
import { encodeProjectTemplateId } from "@/server/common/identifiers";

export async function getProjectTemplatesForUser(
    userId: number,
): Promise<ProjectTemplateOverview[]> {
    const db = await getDb();
    const selected = await db
        .select()
        .from(projectTemplatesTable)
        .where(eq(projectTemplatesTable.userId, userId));

    return selected.map((row) => ({
        id: encodeProjectTemplateId(row.id),
        name: row.name,
        description: row.description,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    }));
}
