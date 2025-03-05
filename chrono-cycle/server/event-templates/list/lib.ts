import { eq, and, getTableColumns } from "drizzle-orm";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { ListResult } from "./data";
import { eventTemplates } from "@/server/db/schema/eventTemplates";
import { EventTemplate } from "@/server/common/data";
import {
    decodeProjectTemplateId,
    encodeEventTemplateId,
    encodeProjectTemplateId,
    encodeTagId,
} from "@/server/common/identifiers";
import { eventTemplateTags, projectTemplates, tags } from "@/server/db/schema";
import getFuncDb from "@/server/db/functional";

export async function listEventTemplates(
    userId: number,
    projectTemplateEncodedId: string,
): Promise<ListResult> {
    const fDb = await getFuncDb();

    // Check if the project template exists.
    const projectTemplateId = decodeProjectTemplateId(projectTemplateEncodedId);
    const checkProjectTemplateTask = fDb.do((db) =>
        db
            .select()
            .from(projectTemplates)
            .where(
                and(
                    eq(projectTemplates.id, projectTemplateId),
                    eq(projectTemplates.userId, userId),
                ),
            ),
    );

    // Retrieve the event templates for the project template.
    const selectEventTemplatesTask = pipe(
        fDb.do((db) =>
            db
                .select({
                    ...getTableColumns(eventTemplates),
                    tagId: tags.id,
                    tagName: tags.name,
                })
                .from(eventTemplates)
                // Must be a left join since we want to get the event template even if it doesn't have any tags.
                .leftJoin(
                    eventTemplateTags,
                    eq(eventTemplates.id, eventTemplateTags.eventTemplateId),
                )
                .leftJoin(tags, eq(eventTemplateTags.tagId, tags.id))
                .where(eq(eventTemplates.projectTemplateId, projectTemplateId)),
        ),
        // Group the rows by event template ID.
        TE.map((rows) => {
            // Store the final EventTemplates to return.
            // Maps database ID to EventTemplate.
            const map = new Map<number, EventTemplate>();
            for (const row of rows) {
                // If we haven't added the event template to the map,
                // create an entry for it.
                if (!map.has(row.id)) {
                    const { id, projectTemplateId, ...partial } = row;
                    map.set(row.id, {
                        id: encodeEventTemplateId(id),
                        projectTemplateId:
                            encodeProjectTemplateId(projectTemplateId),
                        tags: [],
                        ...partial,
                    } satisfies EventTemplate);
                }

                // If there is a tag in the current row, add it to the map entry.
                if (row.tagId) {
                    // Safety: The map entry should have been created earlier,
                    // so this should not be undefined.
                    const et = map.get(row.id) as EventTemplate;

                    et.tags.push({
                        id: encodeTagId(row.tagId),
                        // Safety: Since row.tagId is not null, row.tagName should also not be null.
                        name: row.tagName as string,
                    });
                }
            }

            return Array.from(map.values());
        }),
    );

    const task = pipe(
        checkProjectTemplateTask,
        TE.chain(() => selectEventTemplatesTask),
    );
    return await task();
}
