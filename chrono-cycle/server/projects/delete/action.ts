"use server";

import * as E from "fp-ts/Either";

import { UserSession } from "@/server/auth/sessions";
import { deleteProject } from "./lib";
import {
    DeleteProjectData,
    deleteProjectDataSchema,
    DeleteProjectResult,
} from "./data";
import { ValidationError } from "@/server/common/errors";
import { wrapServerAction } from "@/server/decorators";

async function deleteProjectImpl(
    userSession: UserSession,
    _previousState: DeleteProjectResult | null,
    data: DeleteProjectData,
): Promise<DeleteProjectResult> {
    // Validate form schema.
    const parseResult = deleteProjectDataSchema.safeParse(data);
    if (!parseResult.success) {
        const formattedZodErrors = parseResult.error.format();
        return E.left(
            ValidationError({
                projectId: formattedZodErrors.projectId?._errors || [],
            }),
        );
    }

    return await deleteProject(userSession.user.id, parseResult.data.projectId);
}

export const deleteProjectAction = wrapServerAction(
    "deleteProject",
    deleteProjectImpl,
);
