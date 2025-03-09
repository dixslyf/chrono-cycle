"use server";

import * as E from "fp-ts/Either";

import { UserSession } from "@/server/auth/sessions";
import { listProjects } from "./lib";
import { ListData, listProjectsDataSchema, ListResult } from "./data";
import { wrapServerAction } from "@/server/decorators";
import { ValidationError } from "@/server/common/errors";

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
