import { eq, and } from "drizzle-orm";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import getDb from "@/server/db";
import { ListError, ListResult } from "./data";
import { eventTemplates } from "@/server/db/schema/eventTemplates";
import { DoesNotExistError, InternalError } from "@/server/common/errors";
import { EventTemplate } from "@/server/common/data";
import {
    decodeProjectTemplateId,
    encodeEventTemplateId,
    encodeProjectTemplateId,
} from "@/server/common/identifiers";
import { projectTemplates } from "@/server/db/schema";

export async function listEventTemplates(
    userId: number,
    projectTemplateEncodedId: string,
): Promise<ListResult> {
    const db = await getDb();

    // Check if the project template exists.
    const projectTemplateId = decodeProjectTemplateId(projectTemplateEncodedId);
    const checkProjectTemplateTask = pipe(
        TE.tryCatch(
            () =>
                db
                    .select()
                    .from(projectTemplates)
                    .where(
                        and(
                            eq(projectTemplates.id, projectTemplateId),
                            eq(projectTemplates.userId, userId),
                        ),
                    ),
            (_err) => DoesNotExistError() satisfies ListError as ListError,
        ),
    );

    // Retrieve the event templates for the project template.
    const selectEventTemplatesTask = pipe(
        TE.tryCatch(
            () =>
                db
                    .select()
                    .from(eventTemplates)
                    .where(
                        eq(eventTemplates.projectTemplateId, projectTemplateId),
                    ),
            (_err) =>
                InternalError(
                    "An error occurred while querying the database.",
                ) satisfies ListError as ListError,
        ),
        TE.map((selected) =>
            selected.map((et) => {
                // Map to return type.
                const { id, projectTemplateId, ...partial } = et;
                return {
                    id: encodeEventTemplateId(id),
                    projectTemplateId:
                        encodeProjectTemplateId(projectTemplateId),
                    ...partial,
                } satisfies EventTemplate;
            }),
        ),
    );

    const task = pipe(
        checkProjectTemplateTask,
        TE.chain(() => selectEventTemplatesTask),
    );
    return await task();
}
