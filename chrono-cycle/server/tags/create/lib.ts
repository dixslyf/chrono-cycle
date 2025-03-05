import { eq, and } from "drizzle-orm";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";

import { CreateError, CreateResult, TagExistsError } from "./data";
import { InternalError, ValidationError } from "@/server/common/errors";
import { encodeTagId } from "@/server/common/identifiers";
import { tags, users, DbTagInsert, DbTag } from "@/server/db/schema";
import { Tag, tagNameSchema } from "@/server/common/data";
import getFuncDb from "@/server/db/functional";

export async function getTagIfExists(
    userId: number,
    tagName: string,
): Promise<E.Either<CreateError, O.Option<Tag>>> {
    const fDb = await getFuncDb();

    const task = pipe(
        fDb.do((db) =>
            db
                .select()
                .from(tags)
                .where(and(eq(users.id, userId), eq(tags.name, tagName))),
        ),
        TE.chain((selected): TE.TaskEither<InternalError, O.Option<Tag>> => {
            if (selected.length < 1) {
                // Tag not found.
                return TE.right(O.none);
            } else if (selected.length > 1) {
                return TE.left(
                    InternalError(
                        "Unexpected multiple matching tags while querying the database",
                    ),
                );
            } else {
                // selected.length === 1; i.e., tag has been found.
                // Convert to the output type.
                const tag = {
                    id: encodeTagId(selected[0].id),
                    name: selected[0].name,
                } satisfies Tag;
                return TE.right(O.some(tag));
            }
        }),
    );

    return await task();
}

export async function createTag(
    userId: number,
    tagName: string,
): Promise<CreateResult> {
    const fDb = await getFuncDb();

    // Validate tag name schema.
    const parseResult = tagNameSchema.safeParse(tagName);
    if (!parseResult.success) {
        const formattedErrors = parseResult.error.format();
        return E.left(ValidationError({ name: formattedErrors._errors }));
    }

    // Try insert the tag.
    const insertTask = pipe(
        TE.fromEither(await getTagIfExists(userId, tagName)),
        // Check if the tag already exists.
        TE.chain(function(
            maybeTag: O.Option<Tag>,
        ): TE.TaskEither<CreateError, DbTag[]> {
            // If the tag already exists, then error out.
            if (O.isSome(maybeTag)) {
                return TE.left(TagExistsError());
            }

            // Otherwise, we try inserting the tag.
            return fDb.do((db) =>
                db
                    .insert(tags)
                    .values({
                        userId,
                        name: tagName,
                    } satisfies DbTagInsert)
                    .returning(),
            );
        }),
        TE.map((insertResult) => insertResult[0]), // We've only inserted one value.
        TE.map((dbTag) => {
            // Map to return type.
            return {
                id: encodeTagId(dbTag.id),
                name: dbTag.name,
            } satisfies Tag;
        }),
    );

    return await insertTask();
}

export async function ensureTagExists(
    userId: number,
    tagName: string,
): Promise<CreateResult> {
    const fDb = await getFuncDb();

    // Validate tag name schema.
    const parseResult = tagNameSchema.safeParse(tagName);
    if (!parseResult.success) {
        const formattedErrors = parseResult.error.format();
        return E.left(ValidationError({ name: formattedErrors._errors }));
    }

    // Try inserting the tag.
    const insertTask = pipe(
        TE.fromEither(await getTagIfExists(userId, tagName)),
        // Check if the tag already exists.
        TE.chain(function(
            maybeTag: O.Option<Tag>,
        ): TE.TaskEither<CreateError, Tag> {
            return pipe(
                maybeTag,
                O.map((tag) => TE.right(tag)), // Map to TE.TaskEither.
                // If the tag already exists, then just return it.
                // Otherwise, we have to try inserting.
                O.getOrElse(() =>
                    pipe(
                        fDb.do((db) =>
                            db
                                .insert(tags)
                                .values({
                                    userId,
                                    name: tagName,
                                } satisfies DbTagInsert)
                                .returning(),
                        ),
                        TE.map((insertResult) => insertResult[0]), // We've only inserted one value.
                        TE.map((dbTag) => {
                            // Map to return type.
                            return {
                                id: encodeTagId(dbTag.id),
                                name: dbTag.name,
                            } satisfies Tag;
                        }),
                    ),
                ),
            );
        }),
    );

    return await insertTask();
}
