import { type RunHandleFromTypes, type RunTypes } from "@trigger.dev/core/v3";
import { task, wait } from "@trigger.dev/sdk/v3";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { Event, toEvent } from "@/common/data/domain";

import { decodeEventId } from "@/lib/identifiers";

import { getDb } from "@/db";
import { retrieveExpandedEvent } from "@/db/queries/events/retrieveExpanded";

export type EmailReminderPayload = {
    reminderId: string;
    eventId: string;
    triggerTime: Date;
};

export type EmailReminderOutput = {
    reminderId: string;
    event: Event;
};

export type EmailReminderRunHandle = RunHandleFromTypes<
    RunTypes<"email-reminder", EmailReminderPayload, EmailReminderOutput>
>;

export const emailReminderTask = task({
    id: "email-reminder",
    maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute.
    run: async (payload: EmailReminderPayload, { _ctx }) => {
        await wait.until({ date: payload.triggerTime });

        const { reminderId, eventId } = payload;
        const task = pipe(
            TE.fromTask(getDb),
            TE.chain((db) => retrieveExpandedEvent(db, decodeEventId(eventId))),
            TE.map(toEvent),
            TE.map((event) => ({ reminderId, event })),
            TE.getOrElse((err) => {
                throw err;
            }),
        );
        return await task();
    },
});
