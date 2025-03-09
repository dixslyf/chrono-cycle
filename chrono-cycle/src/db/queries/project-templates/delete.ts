import { and, eq } from "drizzle-orm";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { DoesNotExistError } from "@common/errors";

import { DbLike } from "@db";
import {
    DbProjectTemplate,
    projectTemplates as projectTemplatesTable,
} from "@db/schema";

export function deleteProjectTemplate(
    db: DbLike,
    projectTemplateId: number,
    userId: number,
): TE.TaskEither<DoesNotExistError, DbProjectTemplate> {
    return pipe(
        TE.fromTask(() =>
            db
                .delete(projectTemplatesTable)
                .where(
                    and(
                        eq(projectTemplatesTable.id, projectTemplateId),
                        eq(projectTemplatesTable.userId, userId),
                    ),
                )
                .returning(),
        ),
        TE.chain((deleted) =>
            deleted.length === 0
                ? TE.left(DoesNotExistError())
                : TE.right(deleted[0]),
        ),
    );
}
