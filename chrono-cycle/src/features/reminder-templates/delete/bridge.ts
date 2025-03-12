import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { AssertionError, DoesNotExistError } from "@root/src/common/errors";

import { decodeReminderTemplateId } from "@lib/identifiers";

import getDb from "@db";
import { deleteReminderTemplates } from "@db/queries/reminder-templates/delete";

import { ParsedPayload } from "./data";

export function bridge(
    userId: number,
    payloadP: ParsedPayload,
): TE.TaskEither<DoesNotExistError | AssertionError, void> {
    return pipe(
        TE.fromTask(getDb),
        TE.chain((db) =>
            deleteReminderTemplates(
                db,
                userId,
                new Set(
                    payloadP.reminderTemplateIds.map((id) =>
                        decodeReminderTemplateId(id),
                    ),
                ),
            ),
        ),
    );
}
