"use server";

import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";

import { UserSession } from "@/server/auth/sessions";
import { deleteProjectTemplate } from "./lib";
import { DeleteResult } from "./data";
import { revalidatePath } from "next/cache";
import { DoesNotExistError } from "@/server/common/errors";
import { checkAuth } from "@/server/auth/decorators";

export const deleteProjectTemplateAction = checkAuth(async function(
    userSession: UserSession,
    _previousState: DeleteResult | null,
    name: string,
): Promise<DeleteResult> {
    const userId = userSession.user.id;

    // Project template names are unique, so we don't need the project template ID.
    const deleted = await deleteProjectTemplate(name, userId);
    if (O.isNone(deleted)) {
        return E.left(DoesNotExistError());
    }

    revalidatePath("/templates");
    return E.right({});
});
