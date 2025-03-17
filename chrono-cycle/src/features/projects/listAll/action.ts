"use server";

import * as E from "fp-ts/Either";

import { Project } from "@/common/data/domain";
import { UserSession } from "@/common/data/userSession";
import { RestoreAssertionError } from "@/common/errors";

import { wrapServerAction } from "@/features/utils/decorators";

import { bridge } from "./bridge";
import { Failure, Result } from "./data";

async function listAllProjectsImpl(
    userSession: UserSession,
): Promise<E.Either<RestoreAssertionError<Failure>, Project[]>> {
    // Validate form schema.
    const task = bridge(userSession.user.id);
    return await task();
}

export const listAllProjectsAction: () => Promise<Result> = wrapServerAction(
    "listAllProjects",
    listAllProjectsImpl,
);
