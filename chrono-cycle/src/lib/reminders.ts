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

import { Project, Reminder } from "@/common/data/domain";
import {
    MalformedTimeStringError,
    ScheduleReminderError,
    ScheduleReminderIssue,
} from "@/common/errors";

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

export function scheduleReminder(
    reminder: Reminder,
): TE.TaskEither<ScheduleReminderIssue, EmailReminderRunHandle> {
    return TE.tryCatch(
        () =>
            tasks.trigger<typeof emailReminderTask>("email-reminder", {
                reminderId: reminder.id,
                eventId: reminder.eventId,
                triggerTime: reminder.triggerTime,
            }),
        (err) =>
            ({
                reminderId: reminder.id,
                context: err instanceof Error ? err.message : undefined,
            }) satisfies ScheduleReminderIssue,
    );
}

export function scheduleReminders(
    project: Project,
): TE.TaskEither<ScheduleReminderError, EmailReminderRunHandle[]> {
    return pipe(
        // Try scheduling the reminders.
        project.events
            .map((event) => event.reminders)
            .flat()
            .filter((reminder) => reminder.emailNotifications)
            .map((reminder) => scheduleReminder(reminder)),
        A.sequence(T.ApplicativePar), // Convert to Task<Either<ScheduleReminderError, EmailReminderRunhandle>[]>
        T.map(A.partitionMap(identity)), // Separate the failures from the successes
        TE.fromTask,
        // Check for failures. If there is a failure, then cancel the successful ones
        // and return the errors.
        TE.chain(({ left: issues, right: handles }) =>
            issues.length > 0
                ? pipe(
                      handles,
                      A.traverse(T.ApplicativePar)(
                          (handle) => () => runs.cancel(handle.id),
                      ),
                      () => TE.left(ScheduleReminderError(issues)),
                  )
                : TE.right(handles),
        ),
    );
}
