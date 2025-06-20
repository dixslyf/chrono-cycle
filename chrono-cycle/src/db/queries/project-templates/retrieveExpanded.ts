import { and, eq } from "drizzle-orm";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { AssertionError, DoesNotExistError } from "@/common/errors";

import { DbLike } from "@/db";
import { retrieveExpandedEventTemplatesByProjectTemplateId } from "@/db/queries/event-templates/list";
import {
    DbExpandedProjectTemplate,
    projectTemplates as projectTemplatesTable,
} from "@/db/schema";

export function retrieveExpandedProjectTemplate(
    db: DbLike,
    userId: number,
    projectTemplateId: number,
): TE.TaskEither<
    AssertionError | DoesNotExistError,
    DbExpandedProjectTemplate
> {
    return pipe(
        TE.fromTask(() =>
            db
                .select()
                .from(projectTemplatesTable)
                .where(
                    and(
                        eq(projectTemplatesTable.id, projectTemplateId),
                        eq(projectTemplatesTable.userId, userId),
                    ),
                ),
        ),
        TE.chain((selected) => {
            if (selected.length < 1) {
                return TE.left(
                    DoesNotExistError() as DoesNotExistError | AssertionError,
                );
            }

            if (selected.length > 1) {
                return TE.left(
                    AssertionError(
                        "Unexpected multiple matching project templates",
                    ),
                );
            }

            return TE.right(selected[0]);
        }),
        TE.bind("events", () =>
            TE.fromTask(() =>
                retrieveExpandedEventTemplatesByProjectTemplateId(
                    db,
                    projectTemplateId,
                ),
            ),
        ),
    );
}
