import { eq, or } from "drizzle-orm";
import * as TE from "fp-ts/TaskEither";
import * as E from "fp-ts/Either";
import { NonEmptyArray } from "fp-ts/NonEmptyArray";
import { pipe } from "fp-ts/function";

import getDb from "@/server/db";
import { decodeEventTemplateId } from "@/server/common/identifiers";
import {
    eventTemplates,
    eventTemplates as eventTemplatesTable,
} from "@/server/db/schema";
import { DoesNotExistError, InternalError } from "@/server/common/errors";
import { serverActionLogger } from "@/server/log";
import { DeleteEventTemplatesError, DeleteEventTemplatesResult } from "./data";
import { checkUserOwnsEventTemplates } from "@/server/common/queries";

export async function deleteEventTemplates(
    userId: number,
    encodedIds: string[],
): Promise<DeleteEventTemplatesResult> {
    if (encodedIds.length === 0) {
        return E.right(undefined);
    }

    const db = await getDb();
    const task = pipe(
        checkUserOwnsEventTemplates(
            db,
            userId,
            encodedIds as NonEmptyArray<string>, // Guaranteed to be non-empty since we checked its length earlier.
        ),
        TE.chain(() =>
            TE.tryCatch(
                async () =>
                    await db
                        .delete(eventTemplates)
                        .where(
                            or(
                                ...encodedIds.map((eId) =>
                                    eq(
                                        eventTemplatesTable.id,
                                        decodeEventTemplateId(eId),
                                    ),
                                ),
                            ),
                        )
                        .returning(),
                (err) => {
                    serverActionLogger.error(err);
                    return InternalError() satisfies DeleteEventTemplatesError as DeleteEventTemplatesError;
                },
            ),
        ),
        TE.chain((deleted) => {
            if (deleted.length === 0) {
                return TE.left(DoesNotExistError());
            }

            if (deleted.length > 1) {
                return TE.left(
                    InternalError() satisfies DeleteEventTemplatesError as DeleteEventTemplatesError,
                );
            }

            return TE.right(undefined);
        }),
    );

    return task();
}
