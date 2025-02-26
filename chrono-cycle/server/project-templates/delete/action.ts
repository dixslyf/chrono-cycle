"use server";

import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";

import { getCurrentSession } from "@/server/auth/sessions";
import { deleteProjectTemplate } from "./lib";
import { DeleteResult } from "./data";
import { revalidatePath } from "next/cache";

export async function deleteProjectTemplateAction(
    _previousState: DeleteResult | null,
    name: string,
): Promise<DeleteResult> {
    // Verify user identity.
    const sessionResults = await getCurrentSession();
    if (!sessionResults) {
        return E.left({ _errorKind: "AuthenticationError" });
    }

    const userId = sessionResults.user.id;

    // Project template names are unique, so we don't need the project template ID.
    const deleted = await deleteProjectTemplate(name, userId);
    if (O.isNone(deleted)) {
        return E.left({ _errorKind: "DoesNotExistError" });
    }

    revalidatePath("/templates");
    return E.right({});
}
