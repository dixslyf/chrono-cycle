import { DbSession, DbUser, DbUserSettings } from "@db/schema";

import { Session, User, UserSession, UserSettings } from "./types";

export function toUser(dbUser: DbUser): User {
    const { hashedPassword: _, ...rest } = dbUser;
    return rest;
}

export function toSession(dbSession: DbSession): Session {
    const { id, expiresAt } = dbSession;
    return {
        id,
        expiresAt,
    };
}

export function toUserSession(dbUserSession: {
    user: DbUser;
    session: DbSession;
}): UserSession {
    return {
        user: toUser(dbUserSession.user),
        session: toSession(dbUserSession.session),
    };
}

export function toUserSettings(dbUserSettings: DbUserSettings): UserSettings {
    const { userId, ...rest } = dbUserSettings;
    return rest;
}
