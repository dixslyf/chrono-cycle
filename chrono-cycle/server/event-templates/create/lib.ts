import { eq, and, sql } from "drizzle-orm";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import * as T from "fp-ts/Task";
import * as A from "fp-ts/Array";
import { pipe } from "fp-ts/function";
import getDb from "@/server/db";
import {
    CreateError,
    CreateFormData,
    CreateResult,
    CreateReturnData,
} from "./data";
import eventTemplates, {
    DbEventTemplateInsert,
} from "@/server/db/schema/eventTemplates";
import projectTemplates from "@/server/db/schema/projectTemplates";
import { DoesNotExistError, InternalError } from "@/server/common/errors";
import {
    decodeEventTemplateId,
    decodeProjectTemplateId,
    decodeTagId,
    encodeEventTemplateId,
    encodeProjectTemplateId,
} from "@/server/common/identifiers";
import { ensureTagExists } from "@/server/tags/create/lib";
import { EventTemplate, Tag } from "@/server/common/data";
import { eventTemplateTags } from "@/server/db/schema";

export async function createEventTemplate(
    userId: number,
    info: CreateFormData,
): Promise<CreateResult> {
    const db = await getDb();

    const projectTemplateRealId = decodeProjectTemplateId(
        info.projectTemplateId,
    );

    // Task to check if the project template exists.
    const checkProjectTemplateExistsTask = () =>
        pipe(
            TE.tryCatch(
                () =>
                    db
                        .select()
                        .from(projectTemplates)
                        .where(
                            and(
                                eq(projectTemplates.id, projectTemplateRealId),
                                eq(projectTemplates.userId, userId),
                            ),
                        ),
                (_err) =>
                    InternalError(
                        "An error occurred while querying the database",
                    ) satisfies CreateError as CreateError,
            ),
            TE.chain((projectTemplateResult) => {
                if (projectTemplateResult.length < 1) {
                    return TE.left(DoesNotExistError());
                }

                if (projectTemplateResult.length > 1) {
                    return TE.left(
                        InternalError(
                            "Unexpected multiple matching project templates",
                        ),
                    );
                }

                return TE.right(projectTemplateResult);
            }),
        );

    // Task to create the tags if they don't exist.
    const ensureTagsExistTask = () =>
        pipe(
            info.tags,
            A.traverse(TE.ApplicativeSeq)((tag) =>
                pipe(
                    () => ensureTagExists(userId, tag),
                    T.map(
                        // Convert `CreateTagError` to `CreateError` to satisfy the type checker.
                        (result) =>
                            result satisfies E.Either<
                                CreateError,
                                Tag
                            > as E.Either<CreateError, Tag>,
                    ),
                ),
            ),
        );

    // Task to insert the event template.
    const insertEventTemplateTask = () =>
        pipe(
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
                        "An error occurred while inserting into the database",
                    ) satisfies CreateError as CreateError,
            ),
            TE.map((insertResult) => insertResult[0]), // We've only inserted one value.
            TE.map((et) => {
                // Map to return type.
                const { id, projectTemplateId, ...partial } = et;
                return {
                    id: encodeEventTemplateId(id),
                    projectTemplateId:
                        encodeProjectTemplateId(projectTemplateId),
                    ...partial,
                } satisfies CreateReturnData;
            }),
        );

    // Task to insert into the junction table linking tags and event templates.
    const linkTagsTask = (eventTemplate: EventTemplate, tags: Tag[]) =>
        TE.tryCatch(
            () =>
                db.insert(eventTemplateTags).values(
                    tags.map((tag) => ({
                        eventTemplateId: decodeEventTemplateId(
                            eventTemplate.id,
                        ),
                        tagId: decodeTagId(tag.id),
                    })),
                ),
            (_err) =>
                InternalError(
                    "An error occurred while inserting into the database",
                ) satisfies CreateError as CreateError,
        );

    // Tie everything together.
    const { projectTemplateId, ...eventTemplatePartialInsert } = info;
    const insertTask: TE.TaskEither<CreateError, EventTemplate> = pipe(
        checkProjectTemplateExistsTask(),
        // Start database transaction.
        TE.chain(() =>
            TE.tryCatch(
                () => db.execute(sql`BEGIN`),
                (_err) =>
                    InternalError(
                        "An error occurred while starting a database transaction",
                    ) satisfies CreateError as CreateError,
            ),
        ),
        // Try inserting the event template.
        TE.chain(insertEventTemplateTask),
        // Ensure that all tags exist.
        TE.chain((et) =>
            pipe(
                ensureTagsExistTask(),
                TE.map((tags) => ({ eventTemplate: et, tags })),
            ),
        ),
        // Link the tags with the event template.
        TE.chain(({ eventTemplate, tags }) =>
            pipe(
                linkTagsTask(eventTemplate, tags),
                TE.map(() => eventTemplate), // Ignore the return of `linkTagsTask`, just return the `EventTemplate`.
            ),
        ),
        // Finally, commit on success.
        TE.chain((eventTemplate) =>
            TE.tryCatch(
                () => db.execute(sql`COMMIT`).then(() => eventTemplate), // Ignore the return of the execution and just return the event template.
                (_err) =>
                    InternalError(
                        "An error occurred while committing a database transaction",
                    ) satisfies CreateError as CreateError,
            ),
        ),
        // And roll back on error.
        TE.orElse((err) =>
            pipe(
                TE.tryCatch(
                    () => db.execute(sql`ROLLBACK`).then(() => err),
                    (_err) =>
                        InternalError(
                            "An error occurred while rolling back a database transaction",
                        ),
                ),
                TE.chain((err) => TE.left(err)),
            ),
        ),
    );

    const result = await insertTask();
    return result;
}
