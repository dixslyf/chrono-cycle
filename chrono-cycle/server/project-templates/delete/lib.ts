import { and, eq } from "drizzle-orm";
import * as O from "fp-ts/Option";

import getDb from "@/server/db";
import { projectTemplates as projectTemplatesTable } from "@/server/db/schema/projectTemplates";
import { ProjectTemplateOverview } from "@/server/common/data";
import {
    decodeProjectTemplateId,
    encodeProjectTemplateId,
} from "@/server/common/identifiers";

export async function deleteProjectTemplate(
    projectTemplateEncodedId: string,
    userId: number,
): Promise<O.Option<ProjectTemplateOverview>> {
    const projectTemplateId = decodeProjectTemplateId(projectTemplateEncodedId);

    const db = await getDb();
    const deleted = await db
        .delete(projectTemplatesTable)
        .where(
            and(
                eq(projectTemplatesTable.id, projectTemplateId),
                eq(projectTemplatesTable.userId, userId),
            ),
        )
        .returning();

    if (deleted.length === 0) {
        return O.none;
    }

    return O.some({
        id: encodeProjectTemplateId(deleted[0].id),
        name: deleted[0].name,
        description: deleted[0].description,
        createdAt: deleted[0].createdAt,
        updatedAt: deleted[0].updatedAt,
    });
}
