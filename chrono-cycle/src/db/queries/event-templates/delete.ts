import { eq, or } from "drizzle-orm";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { AssertionError, DoesNotExistError } from "@/common/errors";

import { DbLike } from "@/db";
import { checkUserOwnsEventTemplates } from "@/db/queries/event-templates/checkOwnership";
import { eventTemplates as eventTemplatesTable } from "@/db/schema";

export function deleteEventTemplates(
    db: DbLike,
    userId: number,
    eventTemplateIds: Set<number>,
): TE.TaskEither<AssertionError | DoesNotExistError, void> {
    if (eventTemplateIds.size === 0) {
        return TE.right(undefined);
    }

    return pipe(
        checkUserOwnsEventTemplates(db, userId, eventTemplateIds),
        TE.chain(() =>
            TE.fromTask(() =>
                db
                    .delete(eventTemplatesTable)
                    .where(
                        or(
                            ...Array.from(eventTemplateIds).map((etId) =>
                                eq(eventTemplatesTable.id, etId),
                            ),
                        ),
                    )
                    .returning(),
            ),
        ),
        TE.chain((deleted) => {
            // Since we did `checkUserOwnsEventTemplates()`, the number of deleted event templates
            // should match the number of IDs passed in.
            if (deleted.length !== eventTemplateIds.size) {
                return TE.left(
                    AssertionError(
                        "Unexpected number of deleted event templates",
                    ),
                );
            }

            return TE.right(undefined);
        }),
    );
}
