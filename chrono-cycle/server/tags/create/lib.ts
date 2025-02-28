import { eq, and } from "drizzle-orm";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";

import getDb from "@/server/db";
import { CreateResult } from "./data";
import { InternalError } from "@/server/common/errors";
import { encodeTagId } from "@/server/common/identifiers";
import { tags, users, DbTagInsert } from "@/server/db/schema";
import { Tag, tagNameSchema } from "@/server/common/data";

export async function checkTagExists(
    userId: number,
    tagName: string,
): Promise<boolean> {
    const db = await getDb();

    const selected = await db
        .select()
        .from(tags)
        .where(and(eq(users.id, userId), eq(tags.name, tagName)));

    return selected.length > 0;
}

export async function createTag(
    userId: number,
    tagName: string,
): Promise<CreateResult> {
    const db = await getDb();

    // Validate tag name schema.
    const parseResult = tagNameSchema.safeParse(tagName);
    if (!parseResult.success) {
        const formattedErrors = parseResult.error.format();
        return E.left({
            _errorKind: "ValidationError",
            issues: { name: formattedErrors._errors },
        });
    }

    // Check if the tag already exists.
    if (await checkTagExists(userId, tagName)) {
        return E.left({ _errorKind: "TagExistsError" });
    }

    // Insert the tag.
    const insertTask = pipe(
        TE.tryCatch(
            () =>
                db
                    .insert(tags)
                    .values({
                        userId,
                        name: tagName,
                    } satisfies DbTagInsert)
                    .returning(),
            (_err) =>
                ({
                    _errorKind: "InternalError",
                    context:
                        "An error occurred while inserting into the database.",
                }) satisfies InternalError,
        ),
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
