import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { redirect } from "next/navigation";

import { BaseError, InternalError } from "@/common/errors";

import { authLogger, serverActionLogger } from "@/server/features/utils/log";
import {
    getCurrentUserSession,
    getSessionTokenFromCookie,
    UserSession,
} from "@/server/lib/auth/sessions";

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

export function wrapTryCatch<A extends unknown[], E extends BaseError, R>(
    f: NormalisedArgsFunction<A, E.Either<E, R>>,
): NormalisedArgsFunction<A, E.Either<E | InternalError, R>> {
    return async function(
        ...args: A
    ): Promise<E.Either<E | InternalError, R>> {
        try {
            const result = await f(...args);

            // Log assertion errors and map them to internal errors.
            return pipe(
                result,
                E.mapLeft((err) => {
                    if (err._errorKind === "AssertionError") {
                        serverActionLogger.err(err, "An assertion failed");
                        return InternalError();
                    }
                    return err;
                }),
            );
        } catch (err) {
            serverActionLogger.err(err, "An internal error occurred");
            return E.left(InternalError());
        }
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
    E extends BaseError,
    R,
    O extends WrapServerActionOptions,
>(
    label: string,
    options: O,
    f: O extends { auth: false }
        ? NormalisedArgsFunction<A, E.Either<E | InternalError, R>>
        : UserSessionArgFunction<A, E.Either<E | InternalError, R>>,
): NormalisedArgsFunction<A, E.Either<E | InternalError, R>> {
    const newF = options.auth
        ? wrapAuth(
            label,
            f as UserSessionArgFunction<A, E.Either<E | InternalError, R>>,
        )
        : (f as NormalisedArgsFunction<A, E.Either<E | InternalError, R>>);

    return wrapLog(label, wrapTryCatch(newF));
}

export function wrapServerAction<A extends unknown[], E extends BaseError, R>(
    label: string,
    f: UserSessionArgFunction<A, E.Either<E | InternalError, R>>,
): NormalisedArgsFunction<A, E.Either<E | InternalError, R>> {
    // Use default options if not specified.
    return wrapServerActionWith<
        A,
        E | InternalError,
        R,
        typeof defaultWrapServerActionOptions
    >(label, defaultWrapServerActionOptions, f);
}
