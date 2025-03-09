import { and, eq } from "drizzle-orm";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { DuplicateNameError } from "@common/errors";

import { DbLike } from "@db";
import { projectTemplates as projectTemplatesTable } from "@db/schema";

export function checkDuplicateProjectTemplateName(
    db: DbLike,
    userId: number,
    name: string,
): TE.TaskEither<DuplicateNameError, void> {
    return pipe(
        TE.fromTask(() =>
            db
                .select()
                .from(projectTemplatesTable)
                .where(
                    and(
                        eq(projectTemplatesTable.userId, userId),
                        eq(projectTemplatesTable.name, name),
                    ),
                ),
        ),
        TE.chain((selected) => {
            if (selected.length > 0) {
                return TE.left(DuplicateNameError());
            }

            return TE.right(undefined);
        }),
    );
}
