import { eq, and } from "drizzle-orm";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import * as T from "fp-ts/Task";
import * as A from "fp-ts/Array";
import { pipe } from "fp-ts/function";
import getFuncDb from "@/server/db/functional";
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
    const fDb = await getFuncDb();

    const projectTemplateRealId = decodeProjectTemplateId(
        info.projectTemplateId,
    );

    // Task to check if the project template exists.
    const checkProjectTemplateExistsTask = () =>
        pipe(
            fDb.do((db) =>
                db
                    .select()
                    .from(projectTemplates)
                    .where(
                        and(
                            eq(projectTemplates.id, projectTemplateRealId),
                            eq(projectTemplates.userId, userId),
                        ),
                    ),
            ),
            TE.chain((projectTemplateResult) => {
                if (projectTemplateResult.length < 1) {
                    return TE.left(
                        DoesNotExistError() satisfies CreateError as CreateError,
                    );
                }

                if (projectTemplateResult.length > 1) {
                    return TE.left(
                        InternalError(
                            "Unexpected multiple matching project templates",
                        ) satisfies CreateError as CreateError,
                    );
                }

                return TE.right(undefined);
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
            fDb.do((db) =>
                db
                    .insert(eventTemplates)
                    .values({
                        projectTemplateId: projectTemplateRealId,
                        ...eventTemplatePartialInsert,
                    } satisfies DbEventTemplateInsert)
                    .returning(),
            ),
            TE.mapError((err) => err satisfies CreateError as CreateError),
            TE.map((insertResult) => insertResult[0]), // We've only inserted one value.
        );

    // Task to insert into the junction table linking tags and event templates.
    const linkTagsTask = (eventTemplateId: number, tags: Tag[]) =>
        pipe(
            fDb.do<void>((db) =>
                db
                    .insert(eventTemplateTags)
                    .values(
                        tags.map((tag) => ({
                            eventTemplateId, // Real database ID, not encoded ID.
                            tagId: decodeTagId(tag.id),
                        })),
                    )
                    .then(() => undefined),
            ),
            TE.mapError((err) => err satisfies CreateError as CreateError),
        );

    // Tie everything together.
    const { projectTemplateId, ...eventTemplatePartialInsert } = info;
    const insertTask: TE.TaskEither<CreateError, EventTemplate> = pipe(
        // Try inserting the event template.
        insertEventTemplateTask(),
        // Ensure that all tags exist.
        TE.chain((dbEt) =>
            pipe(
                ensureTagsExistTask(),
                TE.map((tags) => ({ dbEt, tags })),
            ),
        ),
        // Link the tags with the event template.
        TE.chain(({ dbEt, tags }) =>
            pipe(
                linkTagsTask(dbEt.id, tags),
                // Ignore the return of `linkTagsTask`, just return the event template and tags.
                TE.map(() => ({ dbEt, tags })),
            ),
        ),
        TE.map(({ dbEt, tags }) => {
            // Map to return type.
            const { id, projectTemplateId, ...partial } = dbEt;
            return {
                id: encodeEventTemplateId(id),
                projectTemplateId: encodeProjectTemplateId(projectTemplateId),
                tags,
                ...partial,
            } satisfies CreateReturnData;
        }),
    );

    const task = pipe(
        checkProjectTemplateExistsTask(),
        TE.chain(() => fDb.transaction<CreateError, EventTemplate>(insertTask)),
    );
    return await task();
}
