import { DbLike } from "@/db";
import { DbEventTemplateTag, DbTag, eventTemplateTags } from "@/db/schema";

// Task to insert into the junction table linking tags and event templates.
export async function linkTags(
    db: DbLike,
    eventTemplateId: number,
    tags: DbTag[],
): Promise<DbEventTemplateTag[]> {
    if (tags.length === 0) {
        return [];
    }

    return await db
        .insert(eventTemplateTags)
        .values(
            tags.map((tag) => ({
                eventTemplateId,
                tagId: tag.id,
            })),
        )
        .returning();
}
