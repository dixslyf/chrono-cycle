import { type RunHandleFromTypes, type RunTypes } from "@trigger.dev/core/v3";
import { task, wait } from "@trigger.dev/sdk/v3";

export type EmailReminderPayload = {
    reminderId: string;
    eventId: string;
    triggerTime: Date;
};

export type EmailReminderOutput = {
    reminderId: string;
    eventId: string;
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
        return {
            reminderId,
            eventId,
        };
    },
});
