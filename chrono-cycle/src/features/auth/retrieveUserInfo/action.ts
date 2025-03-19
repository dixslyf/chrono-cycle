"use server";

import * as E from "fp-ts/Either";

import { User, UserSession } from "@/common/data/userSession";
import { RestoreAssertionError } from "@/common/errors";

import { wrapServerAction } from "@/features/utils/decorators";

import { Failure, Result } from "./data";

async function retrieveUserInfoActionImpl(
    userSession: UserSession,
): Promise<E.Either<RestoreAssertionError<Failure>, User>> {
    return E.right(userSession.user);
}

export const retrieveUserInfoAction: () => Promise<Result> = wrapServerAction(
    "retrieveUserInfo",
    retrieveUserInfoActionImpl,
);
