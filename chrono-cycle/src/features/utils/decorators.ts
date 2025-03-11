import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as T from "fp-ts/Task";
import * as TO from "fp-ts/TaskOption";
import { redirect } from "next/navigation";

import { UserSession } from "@common/data/userSession";
import { AssertionError, BaseError, InternalError } from "@common/errors";

import { authLogger, serverActionLogger } from "@features/utils/log";

import {
    getCurrentUserSession,
    getSessionTokenFromCookie,
} from "@lib/auth/sessions";

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
        const task = pipe(
            // Verify user identity.
            getCurrentUserSession,
            TO.tapIO((userSession) =>
                authLogger.info(
                    userSession,
                    `Authentication succeeded for "${label}"`,
                ),
            ),
            TO.map((userSession) => f(userSession, ...args)),
            // Redirect if authentication failed.
            TO.getOrElseW(() =>
                pipe(
                    getSessionTokenFromCookie(),
                    T.flatMapIO((maybeToken) =>
                        authLogger.warn(
                            { maybeToken },
                            `Authentication failed while invoking "${label}"`,
                        ),
                    ),
                    T.map(() => redirect("/")),
                ),
            ),
        );

        return await task();
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
): NormalisedArgsFunction<
    A,
    E.Either<Exclude<E, AssertionError> | InternalError, R>
> {
    return async function(
        ...args: A
    ): Promise<E.Either<Exclude<E, AssertionError> | InternalError, R>> {
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
                    return err as Exclude<E, AssertionError>;
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
): NormalisedArgsFunction<
    A,
    E.Either<Exclude<E, AssertionError> | InternalError, R>
> {
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
