import { eq, or } from "drizzle-orm";
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import { NonEmptyArray } from "fp-ts/NonEmptyArray";
import { pipe } from "fp-ts/function";

import getDb from "@/server/db";
import { decodeReminderTemplateId } from "@/server/common/identifiers";
import {
    reminderTemplates,
    reminderTemplates as reminderTemplatesTable,
} from "@/server/db/schema";
import { DoesNotExistError, InternalError } from "@/server/common/errors";
import { serverActionLogger } from "@/server/log";
import {
    DeleteReminderTemplatesError,
    DeleteReminderTemplatesResult,
} from "./data";
import { checkUserOwnsReminderTemplates } from "@/server/common/queries";

export async function deleteReminderTemplates(
    userId: number,
    encodedIds: string[],
): Promise<DeleteReminderTemplatesResult> {
    if (encodedIds.length === 0) {
        return E.right(undefined);
    }

    const db = await getDb();
    const task = pipe(
        checkUserOwnsReminderTemplates(
            db,
            userId,
            encodedIds as NonEmptyArray<string>, // Guaranteed to be non-empty since we checked its length earlier.
        ),
        TE.chain(() =>
            TE.tryCatch(
                async () =>
                    await db
                        .delete(reminderTemplates)
                        .where(
                            or(
                                ...encodedIds.map((eId) =>
                                    eq(
                                        reminderTemplatesTable.id,
                                        decodeReminderTemplateId(eId),
                                    ),
                                ),
                            ),
                        )
                        .returning(),
                (err) => {
                    serverActionLogger.error(err);
                    return InternalError() satisfies DeleteReminderTemplatesError as DeleteReminderTemplatesError;
                },
            ),
        ),
        TE.chain((deleted) => {
            if (deleted.length === 0) {
                return TE.left(DoesNotExistError());
            }

            if (deleted.length > 1) {
                return TE.left(
                    InternalError() satisfies DeleteReminderTemplatesError as DeleteReminderTemplatesError,
                );
            }

            return TE.right(undefined);
        }),
    );

    return task();
}
