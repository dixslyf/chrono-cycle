import { type RunHandleFromTypes, type RunTypes } from "@trigger.dev/core/v3";
import { task, wait } from "@trigger.dev/sdk/v3";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { Event, toEvent } from "@/common/data/domain";
import { toUser, User } from "@/common/data/userSession";

import {
    emailTransport,
    FROM_ADDRESS,
    generateEmailHtmlString,
    generateEmailPlainText,
} from "@/lib/email";
import { decodeEventId, decodeReminderId } from "@/lib/identifiers";

import { getDb } from "@/db";
import { retrieveExpandedEvent } from "@/db/queries/events/retrieveExpanded";
import { retrieveUserOwner } from "@/db/queries/reminders/retrieveUserOwner";
import { updateReminder } from "@/db/queries/reminders/update";

export type EmailReminderPayload = {
    reminderId: string;
    eventId: string;
    triggerTime: Date;
};

export type EmailReminderOutput = {
    reminderId: string;
    event: Event;
    user: User;
};

export type EmailReminderRunHandle = RunHandleFromTypes<
    RunTypes<"email-reminder", EmailReminderPayload, EmailReminderOutput>
>;

export const emailReminderTask = task({
    id: "email-reminder",
    maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute.
    run: async (payload: EmailReminderPayload, { ctx: _ctx }) => {
        await wait.until({ date: payload.triggerTime });

        const reminderId = decodeReminderId(payload.reminderId);
        const eventId = decodeEventId(payload.eventId);
        const task = pipe(
            TE.Do,
            TE.bind("db", () => TE.fromTask(getDb)),

            // Get expanded event to access event details.
            TE.bind("dbExpandedEvent", ({ db }) =>
                retrieveExpandedEvent(db, eventId),
            ),

            // Get the reminder's owner.
            TE.bind("dbUser", ({ db }) => retrieveUserOwner(db, reminderId)),

            // Convert to domain objects.
            TE.bind("event", ({ dbExpandedEvent }) =>
                TE.of(toEvent(dbExpandedEvent)),
            ),
            TE.bind("user", ({ dbUser }) => TE.of(toUser(dbUser))),

            // Send the email.
            TE.tap(({ user, event }) =>
                TE.tryCatch(
                    () =>
                        emailTransport.sendMail({
                            from: FROM_ADDRESS,
                            to: user.email,
                            subject: `Reminder for "${event.name}"`,
                            text: generateEmailPlainText(user, event),
                            html: generateEmailHtmlString(user, event),
                            messageStream: "reminders",
                        }),
                    (err) => err,
                ),
            ),

            // Once the email has been sent, remove the trigger run ID
            // from the reminder database entry.
            TE.tap(({ db }) =>
                updateReminder(db, {
                    id: reminderId,
                    triggerRunId: null,
                }),
            ),

            // Return value for Trigger.dev.
            TE.map(
                ({ event, user }) =>
                    ({
                        reminderId: payload.reminderId,
                        event,
                        user,
                    }) satisfies EmailReminderOutput,
            ),
            TE.getOrElse((err) => {
                throw err;
            }),
        );

        return await task();
    },
});
