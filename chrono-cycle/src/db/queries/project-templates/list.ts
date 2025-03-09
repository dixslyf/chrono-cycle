import { eq } from "drizzle-orm";

import { DbLike } from "@db";
import {
    DbProjectTemplate,
    projectTemplates as projectTemplatesTable,
} from "@db/schema/projectTemplates";

export async function listProjectTemplatesForUser(
    db: DbLike,
    userId: number,
): Promise<DbProjectTemplate[]> {
    return await db
        .select()
        .from(projectTemplatesTable)
        .where(eq(projectTemplatesTable.userId, userId));
}
