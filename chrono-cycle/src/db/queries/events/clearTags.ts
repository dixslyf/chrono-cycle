import { eq } from "drizzle-orm";

import { DbLike } from "@/db";
import { DbEventTag, eventTags } from "@/db/schema";

export async function clearTags(
    db: DbLike,
    eventId: number,
): Promise<DbEventTag[]> {
    return await db
        .delete(eventTags)
        .where(eq(eventTags.eventId, eventId))
        .returning();
}
