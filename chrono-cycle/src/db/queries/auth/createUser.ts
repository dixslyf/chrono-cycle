import { DbLike } from "@db";
import {
    DbExpandedUser,
    DbExpandedUserInsert,
    DbUserSettings,
    DbUserSettingsInsert,
    users,
    userSettings,
} from "@db/schema";

async function createUserSettings(
    db: DbLike,
    toInsert: DbUserSettingsInsert,
): Promise<DbUserSettings> {
    return (await db.insert(userSettings).values(toInsert).returning())[0];
}

export async function createUser(
    db: DbLike,
    toInsert: DbExpandedUserInsert,
): Promise<DbExpandedUser> {
    return db.transaction(async (tx) => {
        const user = (await tx.insert(users).values(toInsert).returning())[0];
        const settings = await createUserSettings(tx, { userId: user.id });
        return {
            ...user,
            settings,
        };
    });
}
