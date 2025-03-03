"use server";

import * as E from "fp-ts/Either";

import { UserSession } from "@/server/auth/sessions";
import { getProjectTemplatesForUser } from "./lib";
import { ListResult } from "./data";
import { wrapServerAction } from "@/server/decorators";

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
