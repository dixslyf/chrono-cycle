"use server";

import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";
import { redirect } from "next/navigation";

import { UserSession } from "@/common/data/userSession";
import { RestoreAssertionError } from "@/common/errors";

import { wrapServerAction } from "@/features/utils/decorators";

import { bridge } from "./bridge";
import { Failure } from "./data";

async function signOutActionImpl(
    userSession: UserSession,
): Promise<E.Either<RestoreAssertionError<Failure>, never>> {
    const task = pipe(
        bridge(userSession.session.id),
        TE.flatMapIO(() => () => redirect("/")),
    );

    return await task();
}

export const signOutAction = wrapServerAction("signOut", signOutActionImpl);
