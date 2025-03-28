import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { EventTemplate, toEventTemplate } from "@/common/data/domain";
import { AssertionError, DoesNotExistError } from "@/common/errors";

import {
    decodeEventTemplateId,
    decodeReminderTemplateId,
} from "@/lib/identifiers";

import { getDb } from "@/db";
import { updateEventTemplate } from "@/db/queries/event-templates/update";

import { ParsedPayload } from "./data";

export function bridge(
    userId: number,
    payloadP: ParsedPayload,
): TE.TaskEither<DoesNotExistError | AssertionError, EventTemplate> {
    return pipe(
        TE.fromTask(getDb),
        TE.chain((db) => {
            const { id, remindersDelete, remindersUpdate, tags, ...rest } =
                payloadP;

            return updateEventTemplate(db, userId, {
                id: decodeEventTemplateId(id),
                remindersDelete: remindersDelete?.map((id) =>
                    decodeReminderTemplateId(id),
                ),
                remindersUpdate: remindersUpdate?.map((rt) => {
                    const { id, ...rest } = rt;
                    return {
                        id: decodeReminderTemplateId(id),
                        ...rest,
                    };
                }),
                tags: tags?.map((name) => ({
                    userId,
                    name,
                })),
                ...rest,
            });
        }),
        TE.map(toEventTemplate),
    );
}
