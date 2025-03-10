"use server";

import { UserSession } from "@/server/common/auth/sessions";
import { wrapServerAction } from "@/server/features/decorators";
import * as E from "fp-ts/Either";

import { ListResult } from "./data";
import { getProjectTemplatesForUser } from "./lib";

async function listProjectTemplatesImpl(
    userSession: UserSession,
): Promise<ListResult> {
    // Fetch project templates for the user.
    const userId = userSession.user.id;
    return E.right(await getProjectTemplatesForUser(userId));
}

export const listProjectTemplatesAction = wrapServerAction(
    "listProjectTemplates",
    listProjectTemplatesImpl,
);
