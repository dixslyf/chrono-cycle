import { type RunHandleFromTypes, type RunTypes } from "@trigger.dev/core/v3";
import { task, wait } from "@trigger.dev/sdk/v3";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { Event, toEvent, toReminder } from "@/common/data/domain";
import { toUser, toUserSettings, User } from "@/common/data/userSession";

import {
    emailTransport,
    FROM_ADDRESS,
    generateEmailHtmlString,
    generateEmailPlainText,
} from "@/lib/email";
import { decodeEventId, decodeReminderId } from "@/lib/identifiers";

import { getDb } from "@/db";
import { retrieveExpandedEvent } from "@/db/queries/events/retrieveExpanded";
import { retrieveReminders } from "@/db/queries/reminders/retrieve";
import { retrieveUserOwner } from "@/db/queries/reminders/retrieveUserOwner";
import { updateReminder } from "@/db/queries/reminders/update";
import { retrieveUserSettings } from "@/db/queries/settings/retrieve";

export type EmailReminderPayload = {
    reminderId: string;
    eventId: string;
    triggerTime: Date;
};

export type EmailReminderOutput = {
    reminderId: string;
    event: Event;
    user: User;
    emailDisabled: boolean;
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

            // Get the reminder to check if notifications are enabled.
            TE.bind("dbReminder", ({ db }) =>
                pipe(
                    retrieveReminders(db, [reminderId]),
                    TE.map((reminders) => reminders[0]),
                ),
            ),

            // Get expanded event to access event details.
            TE.bind("dbExpandedEvent", ({ db }) =>
                retrieveExpandedEvent(db, eventId),
            ),

            // Get the reminder's owner and their settings.
            TE.bind("dbUser", ({ db }) => retrieveUserOwner(db, reminderId)),
            TE.bind("dbUserSettings", ({ db, dbUser }) =>
                retrieveUserSettings(db, dbUser.id),
            ),

            // Convert to domain objects.
            TE.bind("reminder", ({ dbReminder }) =>
                TE.of(toReminder(dbReminder)),
            ),
            TE.bind("event", ({ dbExpandedEvent }) =>
                TE.of(toEvent(dbExpandedEvent)),
            ),
            TE.bind("user", ({ dbUser }) => TE.of(toUser(dbUser))),
            TE.bind("userSettings", ({ dbUserSettings }) =>
                TE.of(toUserSettings(dbUserSettings)),
            ),

            // Send the email if user has enabled email notifications.
            TE.tap(({ user, userSettings, event, reminder }) =>
                userSettings.enableEmailNotifications &&
                    reminder.emailNotifications
                    ? TE.tryCatch(
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
                    )
                    : TE.of(undefined),
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
                ({ event, user, userSettings, reminder }) =>
                    ({
                        reminderId: payload.reminderId,
                        event,
                        user,
                        emailDisabled: !(
                            userSettings.enableEmailNotifications &&
                            reminder.emailNotifications
                        ),
                    }) satisfies EmailReminderOutput,
            ),
            TE.getOrElse((err) => {
                throw err;
            }),
        );

        return await task();
    },
});
