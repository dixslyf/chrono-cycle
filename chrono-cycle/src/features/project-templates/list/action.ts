"use server";

import * as E from "fp-ts/Either";

import { ProjectTemplateOverview } from "@common/data/domain";
import { UserSession } from "@common/data/userSession";

import { wrapServerAction } from "@features/utils/decorators";

import { bridge } from "./bridge";

async function listProjectTemplatesImpl(
    userSession: UserSession,
): Promise<E.Either<never, ProjectTemplateOverview[]>> {
    const task = bridge(userSession.user.id);
    return await task();
}

export const listProjectTemplatesAction = wrapServerAction(
    "listProjectTemplates",
    listProjectTemplatesImpl,
);
