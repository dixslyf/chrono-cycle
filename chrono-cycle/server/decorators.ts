import { authLogger, serverActionLogger } from "@/server/log";
import {
    getCurrentUserSession,
    getSessionTokenFromCookie,
    UserSession,
} from "@/server/auth/sessions";
import { redirect } from "next/navigation";

type NormalisedArgsFunction<A extends unknown[], R> = (
    ...args: A
) => Promise<R>;

type UserSessionArgFunction<A extends unknown[], R> = (
    userSession: UserSession,
    ...args: A
) => Promise<R>;

export function wrapAuth<A extends unknown[], R>(
    label: string,
    f: UserSessionArgFunction<A, R>,
): NormalisedArgsFunction<A, R> {
    return async function(...args: A): Promise<R> {
        // Verify user identity and redirect if authentication failed..
        const userSession = await getCurrentUserSession();
        if (!userSession) {
            const token = await getSessionTokenFromCookie();
            authLogger.warn(
                { token },
                `Authentication failed while invoking "${label}"`,
            );
            redirect("/");
        }

        const logData = {
            sessionToken: userSession.session.id,
            sessionExpiry: userSession.session.expiresAt,
            userId: userSession.user.id,
            username: userSession.user.username,
        };
        authLogger.info(logData, `Authentication succeeded for "${label}"`);
        return f(userSession, ...args);
    };
}

export function wrapLog<A extends unknown[], R>(
    label: string,
    f: NormalisedArgsFunction<A, R>,
): NormalisedArgsFunction<A, R> {
    return async function(...args: A): Promise<R> {
        serverActionLogger.trace({ args }, `Invoked "${label}"`);

        return f(...args).then((returnValue) => {
            serverActionLogger.trace({ returnValue }, `"${label}" returned`);
            return returnValue;
        });
    };
}

export type WrapServerActionOptions = {
    auth: boolean;
};

const defaultWrapServerActionOptions = {
    auth: true,
};

export function wrapServerActionWith<
    A extends unknown[],
    R,
    O extends WrapServerActionOptions,
>(
    label: string,
    options: O,
    f: O extends { auth: false }
        ? NormalisedArgsFunction<A, R>
        : UserSessionArgFunction<A, R>,
): NormalisedArgsFunction<A, R> {
    const newF: NormalisedArgsFunction<A, R> = options.auth
        ? wrapAuth(label, f as UserSessionArgFunction<A, R>)
        : (f as NormalisedArgsFunction<A, R>);

    return wrapLog(label, newF);
}

export function wrapServerAction<A extends unknown[], R>(
    label: string,
    f: UserSessionArgFunction<A, R>,
): NormalisedArgsFunction<A, R> {
    // Use default options if not specified.
    return wrapServerActionWith<A, R, typeof defaultWrapServerActionOptions>(
        label,
        defaultWrapServerActionOptions,
        f,
    );
}
