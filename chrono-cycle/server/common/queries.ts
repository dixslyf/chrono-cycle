import { and, eq, or } from "drizzle-orm";
import { NonEmptyArray } from "fp-ts/NonEmptyArray";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";

import { DbLike } from "@/server/db";
import { DoesNotExistError, InternalError } from "./errors";
import {
    eventTemplates as eventTemplatesTable,
    projectTemplates as projectTemplatesTable,
    users as usersTable,
} from "@/server/db/schema";
import { decodeEventTemplateId } from "./identifiers";
import { serverActionLogger } from "../log";

// Checks that the user owns the event templates.
export function checkUserOwnsEventTemplates(
    db: DbLike,
    userId: number,
    etIds: NonEmptyArray<string>,
): TE.TaskEither<DoesNotExistError | InternalError, void> {
    const uniqueEtIds = Array.from(new Set(etIds));

    const conditions = uniqueEtIds.map((etId) =>
        and(
            eq(usersTable.id, userId),
            eq(eventTemplatesTable.id, decodeEventTemplateId(etId)),
        ),
    );

    const task = pipe(
        TE.tryCatch(
            async () =>
                await db
                    .select()
                    .from(usersTable)
                    .innerJoin(
                        projectTemplatesTable,
                        eq(usersTable.id, projectTemplatesTable.userId),
                    )
                    .innerJoin(
                        eventTemplatesTable,
                        eq(projectTemplatesTable.id, eventTemplatesTable.id),
                    )
                    .where(or(...conditions)),
            (err) => {
                serverActionLogger.error(err);
                return InternalError() as DoesNotExistError | InternalError;
            },
        ),
        TE.chain((rows) => {
            if (rows.length < uniqueEtIds.length) {
                return TE.left(DoesNotExistError());
            }

            if (rows.length > uniqueEtIds.length) {
                return TE.left(
                    InternalError(
                        "Unexpected multiple matching event templates",
                    ),
                );
            }

            return TE.right(undefined);
        }),
    );

    return task;
}
