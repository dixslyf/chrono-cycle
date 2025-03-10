"use server";

import { UserSession } from "@/server/common/auth/sessions";
import { ValidationError } from "@/server/common/errors";
import { wrapServerAction } from "@/server/features/decorators";
import * as E from "fp-ts/Either";

import { ListData, listProjectsDataSchema, ListResult } from "./data";
import { listProjects } from "./lib";

async function listProjectsImpl(
    userSession: UserSession,
    data: ListData,
): Promise<ListResult> {
    // Validate form schema.
    const parseResult = listProjectsDataSchema.safeParse(data);
    if (!parseResult.success) {
        const formattedZodErrors = parseResult.error.format();
        return E.left(
            ValidationError({
                projectTemplateId:
                    formattedZodErrors.projectTemplateId?._errors || [],
            }),
        );
    }

    const userId = userSession.user.id;
    return await listProjects(userId, parseResult.data.projectTemplateId);
}

export const listProjectsAction = wrapServerAction(
    "listProjects",
    listProjectsImpl,
);
