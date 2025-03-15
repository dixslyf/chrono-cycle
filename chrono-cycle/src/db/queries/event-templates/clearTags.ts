import { eq } from "drizzle-orm";

import { DbLike } from "@/db";
import { DbEventTemplateTag, eventTemplateTags } from "@/db/schema";

export async function clearTags(
    db: DbLike,
    eventTemplateId: number,
): Promise<DbEventTemplateTag[]> {
    return await db
        .delete(eventTemplateTags)
        .where(eq(eventTemplateTags.eventTemplateId, eventTemplateId))
        .returning();
}
