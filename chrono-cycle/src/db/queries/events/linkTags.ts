import { DbLike } from "@/db";
import { DbEventTag, DbTag, eventTags } from "@/db/schema";

// Task to insert into the junction table linking tags and event templates.
export async function linkTags(
    db: DbLike,
    eventId: number,
    tags: DbTag[],
): Promise<DbEventTag[]> {
    if (tags.length === 0) {
        return [];
    }

    return await db
        .insert(eventTags)
        .values(
            tags.map((tag) => ({
                eventId,
                tagId: tag.id,
            })),
        )
        .returning();
}
