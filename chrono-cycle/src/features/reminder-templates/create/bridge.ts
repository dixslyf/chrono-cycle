import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { ReminderTemplate, toReminderTemplate } from "@common/data/domain";
import { AssertionError, DoesNotExistError } from "@common/errors";

import { decodeEventTemplateId } from "@lib/identifiers";

import getDb from "@db";
import { createReminderTemplates } from "@db/queries/reminder-templates/create";

import { ParsedPayload } from "./data";

export function bridge(
    userId: number,
    payloadP: ParsedPayload,
): TE.TaskEither<DoesNotExistError | AssertionError, ReminderTemplate> {
    return pipe(
        TE.fromTask(getDb),
        TE.chain((db) => {
            const { eventTemplateId, ...rest } = payloadP;
            return createReminderTemplates(db, userId, [
                {
                    eventTemplateId: decodeEventTemplateId(eventTemplateId),
                    ...rest,
                },
            ]);
        }),
        TE.map((rts) => toReminderTemplate(rts[0])),
    );
}
