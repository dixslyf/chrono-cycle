"use server";

import * as E from "fp-ts/Either";

import { getCurrentSession } from "@/server/auth/sessions";
import { getProjectTemplatesForUser } from "./lib";
import { ListResult } from "./data";

export async function listProjectTemplatesAction(): Promise<ListResult> {
    // Verify user identity.
    const sessionResults = await getCurrentSession();
    if (!sessionResults) {
        return E.left({ _errorKind: "AuthenticationError" });
    }

    // Fetch project templates for the user.
    const userId = sessionResults.user.id;
    return E.right(await getProjectTemplatesForUser(userId));
}
