import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { and, eq } from "drizzle-orm";

import { DbLike } from "@/server/db";
import { projectTemplates as projectTemplatesTable } from "@/server/db/schema/projectTemplates";
import { UpdateData, UpdateError } from "./data";
import { ProjectTemplateOverview } from "@/server/common/data";
import {
    decodeProjectTemplateId,
    encodeProjectTemplateId,
} from "@/server/common/identifiers";
import { serverActionLogger } from "@/server/log";
import {
    DoesNotExistError,
    DuplicateNameError,
    InternalError,
} from "@/server/common/errors";

export function checkDuplicateProjectTemplateName(
    db: DbLike,
    userId: number,
    name: string,
): TE.TaskEither<InternalError | DuplicateNameError, void> {
    const task = pipe(
        TE.tryCatch(
            async () =>
                await db
                    .select()
                    .from(projectTemplatesTable)
                    .where(
                        and(
                            eq(projectTemplatesTable.userId, userId),
                            eq(projectTemplatesTable.name, name),
                        ),
                    ),
            (err) => {
                serverActionLogger.error(err);
                return InternalError() as InternalError | DuplicateNameError;
            },
        ),
        TE.chain((selected) => {
            if (selected.length > 0) {
                return TE.left(DuplicateNameError());
            }

            return TE.right(undefined);
        }),
    );

    return task;
}

export function updateProjectTemplateDb(
    db: DbLike,
    updateData: UpdateData,
): TE.TaskEither<InternalError | DoesNotExistError, ProjectTemplateOverview> {
    const { id, ...setData } = updateData;
    const task = pipe(
        TE.tryCatch(
            async () =>
                await db.transaction(async (tx) => {
                    const updated = await tx
                        .update(projectTemplatesTable)
                        .set({ updatedAt: new Date(), ...setData })
                        .where(
                            eq(
                                projectTemplatesTable.id,
                                decodeProjectTemplateId(id),
                            ),
                        )
                        .returning();

                    if (updated.length > 1) {
                        // Throwing an error will cause a rollback.
                        throw InternalError("Unexpected multiple updates");
                    }

                    return updated;
                }),
            (err) => {
                serverActionLogger.error(err);
                return InternalError() as InternalError | DoesNotExistError;
            },
        ),
        TE.chain((updated) => {
            if (updated.length === 0) {
                return TE.left(DoesNotExistError());
            }

            // Map to ProjectTemplateOverview.
            const { id, userId, ...rest } = updated[0];
            return TE.right({
                id: encodeProjectTemplateId(id),
                ...rest,
            });
        }),
    );

    return task;
}

export function updateProjectTemplate(
    db: DbLike,
    userId: number,
    updateData: UpdateData,
): TE.TaskEither<UpdateError, ProjectTemplateOverview> {
    const task = pipe(
        updateData.name
            ? checkDuplicateProjectTemplateName(db, userId, updateData.name)
            : TE.right(undefined),
        TE.chain<UpdateError, void, ProjectTemplateOverview>(() =>
            updateProjectTemplateDb(db, updateData),
        ),
    );

    return task;
}
