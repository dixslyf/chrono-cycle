"use server";

import * as E from "fp-ts/Either";

import { UserSession, UserSettings } from "@/common/data/userSession";
import { RestoreAssertionError } from "@/common/errors";

import { wrapServerAction } from "@/features/utils/decorators";

import { bridge } from "./bridge";
import { Failure, Result } from "./data";

async function retrieveSettingsActionImpl(
    userSession: UserSession,
): Promise<E.Either<RestoreAssertionError<Failure>, UserSettings>> {
    const userId = userSession.user.id;
    const task = bridge(userId);
    return await task();
}

export const retrieveSettingsAction: () => Promise<Result> = wrapServerAction(
    "retrieveSettings",
    retrieveSettingsActionImpl,
);
