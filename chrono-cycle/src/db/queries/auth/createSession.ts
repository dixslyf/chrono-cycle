import { DbLike } from "@db";
import {
    DbSession,
    DbSessionInsert,
    sessions as sessionsTable,
} from "@db/schema";

export async function createSession(
    db: DbLike,
    data: DbSessionInsert,
): Promise<DbSession> {
    return (await db.insert(sessionsTable).values(data).returning())[0];
}
