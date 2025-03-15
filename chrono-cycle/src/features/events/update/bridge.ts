import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { Event, toEvent } from "@/common/data/domain";
import { AssertionError, DoesNotExistError } from "@/common/errors";

import { decodeProjectId, decodeReminderId } from "@/lib/identifiers";

import getDb from "@/db";
import { updateEvent } from "@/db/queries/events/update";

import { ParsedPayload } from "./data";

export function bridge(
    userId: number,
    payloadP: ParsedPayload,
): TE.TaskEither<DoesNotExistError | AssertionError, Event> {
    return pipe(
        TE.fromTask(getDb),
        TE.chain((db) => {
            const { id, remindersDelete, remindersUpdate, ...rest } = payloadP;

            return updateEvent(db, userId, {
                id: decodeProjectId(id),
                remindersDelete: remindersDelete.map((id) =>
                    decodeReminderId(id),
                ),
                remindersUpdate: remindersUpdate.map((rt) => {
                    const { id, ...rest } = rt;
                    return {
                        id: decodeReminderId(id),
                        ...rest,
                    };
                }),
                ...rest,
            });
        }),
        TE.map(toEvent),
    );
}
