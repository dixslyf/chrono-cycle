import {
    EmailReminderRunHandle,
    emailReminderTask,
} from "@/trigger/emailReminder";
import { runs, tasks } from "@trigger.dev/sdk/v3";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import { identity, pipe } from "fp-ts/function";
import * as T from "fp-ts/Task";
import * as TE from "fp-ts/TaskEither";

import {
    CancelReminderError,
    MalformedTimeStringError,
    ScheduleReminderError,
    ScheduleReminderIssue,
} from "@/common/errors";

import { DbExpandedProject, DbReminder } from "@/db/schema";

import { encodeEventId, encodeReminderId } from "./identifiers";

export type TimeComponents = {
    hours: number;
    minutes: number;
};

export function extractTimeStringComponents(
    timeStr: string,
): E.Either<MalformedTimeStringError, TimeComponents> {
    // Match "HH:MM".
    const match = timeStr.match(/^(\d{2}):(\d{2})/);
    if (!match) {
        return E.left(MalformedTimeStringError());
    }

    // First value is the entire matched part.
    const [_, hours, minutes] = match.map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        return E.left(MalformedTimeStringError());
    }

    return E.right({ hours, minutes });
}

export type ScheduledDbReminder = {
    reminder: DbReminder;
    handle: EmailReminderRunHandle;
};

export function cancelReminder(
    runId: string,
): TE.TaskEither<CancelReminderError, void> {
    return TE.tryCatch(
        () => runs.cancel(runId).then(() => undefined),
        (err) =>
            CancelReminderError(
                runId,
                err instanceof Error ? err.message : undefined,
            ),
    );
}

export function scheduleReminder(
    dbReminder: DbReminder,
): TE.TaskEither<ScheduleReminderIssue, ScheduledDbReminder> {
    return pipe(
        TE.tryCatch(
            () =>
                tasks.trigger<typeof emailReminderTask>("email-reminder", {
                    reminderId: encodeReminderId(dbReminder.id),
                    eventId: encodeEventId(dbReminder.eventId),
                    triggerTime: dbReminder.triggerTime,
                }),
            (err) =>
                ({
                    reminderId: encodeReminderId(dbReminder.id),
                    context: err instanceof Error ? err.message : undefined,
                }) satisfies ScheduleReminderIssue,
        ),
        TE.map((handle) => ({ reminder: dbReminder, handle })),
    );
}

export function scheduleReminders(
    reminders: DbReminder[],
): TE.TaskEither<
    ScheduleReminderError | CancelReminderError,
    ScheduledDbReminder[]
> {
    return pipe(
        reminders
            // Filter to those with email notifications and whose trigger is later
            // the current date and time.
            .filter(
                (reminder) =>
                    reminder.emailNotifications &&
                    reminder.triggerTime >= new Date(),
            )
            // Try scheduling the reminders.
            .map((reminder) => scheduleReminder(reminder)),
        A.sequence(T.ApplicativePar), // Convert to Task<Either<ScheduleReminderError, EmailReminderRunhandle>[]>
        T.map(A.partitionMap(identity)), // Separate the failures from the successes
        TE.fromTask,
        // Check for failures. If there is a failure, then cancel the successful ones
        // and return the errors.
        TE.chain(({ left: issues, right: scheduledReminders }) =>
            issues.length > 0
                ? pipe(
                      scheduledReminders,
                      A.traverse(TE.ApplicativePar)((scheduledReminder) =>
                          cancelReminder(scheduledReminder.handle.id),
                      ),
                      () => TE.left(ScheduleReminderError(issues)),
                  )
                : TE.right(scheduledReminders),
        ),
    );
}

export function scheduleRemindersForProject(
    dbExpandedProject: DbExpandedProject,
): TE.TaskEither<
    ScheduleReminderError | CancelReminderError,
    ScheduledDbReminder[]
> {
    const dbReminders = dbExpandedProject.events
        .map((dbEvent) => dbEvent.reminders)
        .flat();
    return scheduleReminders(dbReminders);
}
