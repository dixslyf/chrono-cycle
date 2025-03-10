import { DbSession, DbUser } from "@db/schema";

import { Session, User, UserSession } from "./types";

export function toUser(dbUser: DbUser): User {
    const { hashedPassword: _, ...rest } = dbUser;
    return rest;
}

export function toSession(dbSession: DbSession): Session {
    const { id, expiresAt } = dbSession;
    return {
        token: id,
        expiresAt,
    };
}

export function toUserSession(
    dbUser: DbUser,
    dbSession: DbSession,
): UserSession {
    return {
        user: toUser(dbUser),
        session: toSession(dbSession),
    };
}
