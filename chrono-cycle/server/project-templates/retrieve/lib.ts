import { eq, and } from "drizzle-orm";
import * as O from "fp-ts/Option";

import getDb from "@/server/db";
import { projectTemplates as projectTemplatesTable } from "@/server/db/schema/projectTemplates";
import { ProjectTemplateData } from "./data";
import { decodeProjectTemplateId } from "@/server/common/identifiers";

export async function retrieveProjectTemplate(
    projectTemplateEncodedId: string,
    userId: number,
): Promise<O.Option<ProjectTemplateData>> {
    const projectTemplateId = decodeProjectTemplateId(projectTemplateEncodedId);

    const db = await getDb();
    const selected = await db
        .select()
        .from(projectTemplatesTable)
        .where(
            and(
                eq(projectTemplatesTable.id, projectTemplateId),
                eq(projectTemplatesTable.userId, userId),
            ),
        );

    if (selected.length <= 0) {
        return O.none;
    }

    return O.some({
        id: projectTemplateEncodedId,
        name: selected[0].name,
        description: selected[0].description,
        createdAt: selected[0].createdAt,
        updatedAt: selected[0].updatedAt,
    });
}
