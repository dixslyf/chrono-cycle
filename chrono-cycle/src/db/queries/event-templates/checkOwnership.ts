import { and, eq, or } from "drizzle-orm";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { AssertionError, DoesNotExistError } from "@/common/errors";

import { DbLike } from "@/db";
import {
    eventTemplates as eventTemplatesTable,
    projectTemplates as projectTemplatesTable,
    users as usersTable,
} from "@/db/schema";

// Checks that the user owns the event templates.
export function checkUserOwnsEventTemplates(
    db: DbLike,
    userId: number,
    etIds: Set<number>,
): TE.TaskEither<DoesNotExistError | AssertionError, void> {
    const etIdsArray = Array.from(etIds);

    const conditions = etIdsArray.map((etId) =>
        and(eq(usersTable.id, userId), eq(eventTemplatesTable.id, etId)),
    );

    return pipe(
        TE.fromTask(() =>
            db
                .select()
                .from(usersTable)
                .innerJoin(
                    projectTemplatesTable,
                    eq(usersTable.id, projectTemplatesTable.userId),
                )
                .innerJoin(
                    eventTemplatesTable,
                    eq(
                        projectTemplatesTable.id,
                        eventTemplatesTable.projectTemplateId,
                    ),
                )
                .where(or(...conditions)),
        ),
        TE.chain((rows) => {
            if (rows.length < etIdsArray.length) {
                return TE.left(
                    DoesNotExistError() as DoesNotExistError | AssertionError,
                );
            }

            if (rows.length > etIdsArray.length) {
                return TE.left(
                    AssertionError(
                        "Unexpected multiple matching event templates",
                    ),
                );
            }

            return TE.right(undefined);
        }),
    );
}
