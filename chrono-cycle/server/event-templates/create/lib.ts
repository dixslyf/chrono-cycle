import { eq, and } from "drizzle-orm";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import * as T from "fp-ts/Task";
import * as A from "fp-ts/Array";
import { pipe } from "fp-ts/function";
import getFuncDb, { FunctionalDatabase } from "@/server/db/functional";
import {
    CreateError,
    CreateFormData,
    CreateResult,
    CreateReturnData,
} from "./data";
import eventTemplates, {
    DbEventTemplate,
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

// Task to check if the project template exists.
function checkProjectTemplateExistsTask(
    fDb: FunctionalDatabase,
    projectTemplateId: number,
    userId: number,
): TE.TaskEither<CreateError, void> {
    return pipe(
        fDb.do((db) =>
            db
                .select()
                .from(projectTemplates)
                .where(
                    and(
                        eq(projectTemplates.id, projectTemplateId),
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
}

// Task to create the tags if they don't exist.
function ensureTagsExistTask(
    userId: number,
    tags: string[],
): TE.TaskEither<CreateError, Tag[]> {
    return pipe(
        tags,
        A.traverse(TE.ApplicativeSeq)((tag) =>
            pipe(
                () => ensureTagExists(userId, tag),
                T.map(
                    // Convert `CreateTagError` to `CreateError` to satisfy the type checker.
                    (result) =>
                        result satisfies E.Either<CreateError, Tag> as E.Either<
                            CreateError,
                            Tag
                        >,
                ),
            ),
        ),
    );
}

// Task to insert the event template.
function insertEventTemplateTask(
    fDb: FunctionalDatabase,
    data: CreateFormData,
): TE.TaskEither<CreateError, DbEventTemplate> {
    const { projectTemplateId, ...eventTemplatePartialInsert } = data;
    return pipe(
        fDb.do((db) =>
            db
                .insert(eventTemplates)
                .values({
                    projectTemplateId:
                        decodeProjectTemplateId(projectTemplateId),
                    ...eventTemplatePartialInsert,
                } satisfies DbEventTemplateInsert)
                .returning(),
        ),
        TE.mapError((err) => err satisfies CreateError as CreateError),
        TE.map((insertResult) => insertResult[0]), // We've only inserted one value.
    );
}

// Task to insert into the junction table linking tags and event templates.
function linkTagsTask(
    fDb: FunctionalDatabase,
    eventTemplateId: number,
    tags: Tag[],
) {
    return pipe(
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
}

export async function createEventTemplate(
    userId: number,
    data: CreateFormData,
): Promise<CreateResult> {
    const fDb = await getFuncDb();

    const projectTemplateId = decodeProjectTemplateId(data.projectTemplateId);

    // Tie everything together.
    const insertTask: TE.TaskEither<CreateError, EventTemplate> = pipe(
        // Try inserting the event template.
        insertEventTemplateTask(fDb, data),
        // Ensure that all tags exist.
        TE.chain((dbEt) =>
            pipe(
                ensureTagsExistTask(userId, data.tags),
                TE.map((tags) => ({ dbEt, tags })),
            ),
        ),
        // Link the tags with the event template.
        TE.chain(({ dbEt, tags }) =>
            pipe(
                linkTagsTask(fDb, dbEt.id, tags),
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
                reminders: [],
                tags,
                ...partial,
            } satisfies CreateReturnData;
        }),
    );

    const task = pipe(
        checkProjectTemplateExistsTask(fDb, projectTemplateId, userId),
        TE.chain(() => fDb.transaction<CreateError, EventTemplate>(insertTask)),
    );
    return await task();
}
