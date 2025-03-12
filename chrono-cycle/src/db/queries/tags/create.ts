import { and, eq, or } from "drizzle-orm";
import * as A from "fp-ts/Array";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";

import { AssertionError, TagExistsError } from "@/common/errors";

import type { DbLike } from "@/db";
import { tags as tagsTable, type DbTag, type DbTagInsert } from "@/db/schema";

export async function insertTagsUnchecked(
    db: DbLike,
    tags: DbTagInsert[],
): Promise<DbTag[]> {
    if (tags.length === 0) {
        return [];
    }
    return await db.insert(tagsTable).values(tags).returning();
}

export function getTagsIfExist(
    db: DbLike,
    tags: Omit<DbTag, "id">[],
): TE.TaskEither<AssertionError, O.Option<DbTag>[]> {
    return pipe(
        TE.fromTask(() =>
            db
                .select()
                .from(tagsTable)
                .where(
                    or(
                        ...tags.map((tag) =>
                            and(
                                eq(tagsTable.userId, tag.userId),
                                eq(tagsTable.name, tag.name),
                            ),
                        ),
                    ),
                ),
        ),
        TE.map((storedTags) => {
            // Map tag name to the DbTag.
            const storedTagMap = new Map<string, DbTag>();
            for (const storedTag of storedTags) {
                storedTagMap.set(storedTag.name, storedTag);
            }

            // Return options in the same order as the query array.
            return tags.map((tag) =>
                O.fromNullable(storedTagMap.get(tag.name)),
            );
        }),
    );
}

export function createTags(
    db: DbLike,
    tags: DbTagInsert[],
): TE.TaskEither<AssertionError | TagExistsError, DbTag[]> {
    if (tags.length === 0) {
        return TE.right([]);
    }

    return pipe(
        getTagsIfExist(db, tags),
        TE.chain<AssertionError | TagExistsError, O.Option<DbTag>[], DbTag[]>(
            // If there is at least one tag that already exists, error out.
            // Otherwise, none of the tags exists, so insert.
            (maybeStoredTag) =>
                pipe(maybeStoredTag, A.some(O.isSome))
                    ? TE.left(TagExistsError())
                    : TE.fromTask(() => insertTagsUnchecked(db, tags)),
        ),
    );
}

export function ensureTagsExist(
    db: DbLike,
    tags: DbTagInsert[],
): TE.TaskEither<AssertionError, DbTag[]> {
    return pipe(
        getTagsIfExist(db, tags),
        TE.chain((maybeStoredTags) => {
            // Map of tag name to DbTag.
            const storedTagMap = new Map<string, DbTag>();

            // Add stored tags to the map.
            for (const maybeStoredTag of maybeStoredTags) {
                pipe(
                    maybeStoredTag,
                    O.match(
                        () => { },
                        (storedTag) =>
                            storedTagMap.set(storedTag.name, storedTag),
                    ),
                );
            }

            // Filter the tags list to only those that need to be inserted.
            const toInsert = pipe(
                A.zip(tags, maybeStoredTags), // `getTagsIfExist()` returns an array in the same order as tags, so we can zip.
                A.filter(([_tag, maybeStoredTag]) => O.isNone(maybeStoredTag)),
                A.map(([tag, _maybeStoredTag]) => tag),
            );

            return TE.fromTask(() =>
                insertTagsUnchecked(db, toInsert).then((insertedTags) => {
                    // Add the inserted tags to the map.
                    for (const insertedTag of insertedTags) {
                        storedTagMap.set(insertedTag.name, insertedTag);
                    }

                    // Return the tags in the same order as the input tag array.
                    // Safety: Guaranteed to not be undefined since the map should now
                    // have all input tags.
                    return tags.map(
                        (tag) => storedTagMap.get(tag.name) as DbTag,
                    );
                }),
            );
        }),
    );
}
