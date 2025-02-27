import { eq, and } from "drizzle-orm";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import getDb from "@/server/db";
import { CreateFormData, CreateResult, CreateReturnData } from "./data";
import eventTemplates, {
    DbEventTemplateInsert,
} from "@/server/db/schema/eventTemplates";
import projectTemplates from "@/server/db/schema/projectTemplates";
import { DoesNotExistError, InternalError } from "@/server/common/errors";
import {
    decodeProjectTemplateId,
    encodeEventTemplateId,
    encodeProjectTemplateId,
} from "@/server/common/identifiers";

export async function createEventTemplate(
    userId: number,
    info: CreateFormData,
): Promise<CreateResult> {
    const db = await getDb();

    // Check if the project template exists.
    const projectTemplateRealId = decodeProjectTemplateId(
        info.projectTemplateId,
    );
    const projectTemplateResult = await db
        .select()
        .from(projectTemplates)
        .where(
            and(
                eq(projectTemplates.id, projectTemplateRealId),
                eq(projectTemplates.userId, userId),
            ),
        );

    if (projectTemplateResult.length < 1) {
        return E.left(DoesNotExistError());
    }

    if (projectTemplateResult.length > 1) {
        return E.left(
            InternalError("Unexpected multiple matching project templates"),
        );
    }

    // Insert the event.
    const { projectTemplateId, ...eventTemplatePartialInsert } = info;
    const insertTask = pipe(
        TE.tryCatch(
            () =>
                db
                    .insert(eventTemplates)
                    .values({
                        projectTemplateId: projectTemplateRealId,
                        ...eventTemplatePartialInsert,
                    } satisfies DbEventTemplateInsert)
                    .returning(),
            (_err) =>
                InternalError(
                    "An error occurred while inserting into the database.",
                ),
        ),
        TE.map((insertResult) => insertResult[0]), // We've only inserted one value.
        TE.map((et) => {
            // Map to return type.
            const { id, projectTemplateId, ...partial } = et;
            return {
                id: encodeEventTemplateId(id),
                projectTemplateId: encodeProjectTemplateId(projectTemplateId),
                ...partial,
            } satisfies CreateReturnData;
        }),
    );

    return await insertTask();
}
