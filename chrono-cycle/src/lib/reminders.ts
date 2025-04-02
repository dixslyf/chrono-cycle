import {
    EmailReminderRunHandle,
    emailReminderTask,
} from "@/trigger/emailReminder";
import { stubTriggerLog } from "@/trigger/log";
import { encodeBase64 } from "@oslojs/encoding";
import type { InferRunTypes, RunHandleFromTypes } from "@trigger.dev/core/v3";
import {
    runs,
    tasks,
    type AnyTask,
    type TaskIdentifier,
    type TaskPayload,
} from "@trigger.dev/sdk/v3";
import * as A from "fp-ts/Array";
import { identity, pipe } from "fp-ts/function";
import * as T from "fp-ts/Task";
import * as TE from "fp-ts/TaskEither";

import {
    CancelReminderError,
    ScheduleReminderError,
    ScheduleReminderIssue,
} from "@/common/errors";

import { DbExpandedProject, DbReminder } from "@/db/schema";

import { encodeEventId, encodeReminderId } from "./identifiers";

// Implementation changes to a stub in `dev`.
const cancelRun =
    process.env.NODE_ENV === "development" &&
    process.env.TRIGGER_DEV === undefined
        ? async (runId: string) => {
              const ret = { id: runId };
              stubTriggerLog.trace(
                  {
                      runId,
                      returnValue: ret,
                  },
                  "Cancelled run",
              );
              return ret;
          }
        : runs.cancel;

// Implementation changes to a stub in `dev`.
const triggerTask =
    process.env.NODE_ENV === "development" &&
    process.env.TRIGGER_DEV === undefined
        ? async <TTask extends AnyTask>( // Stub
              taskIdentifier: TaskIdentifier<TTask>,
              payload: TaskPayload<TTask>,
          ): Promise<RunHandleFromTypes<InferRunTypes<TTask>>> => {
              // Generate random ID.
              const bytes = new Uint8Array(16);
              crypto.getRandomValues(bytes);
              const id = `stub-run-${encodeBase64(bytes)}`;

              // Safety: RunHandleFromTypes<InferRunTypes<TTask>> is a branded type.
              // We've already satisfied the required attributes, just not the "hidden"
              // brand properties.
              const handle = {
                  id,
                  publicAccessToken: "stub-public-access-token",
                  taskIdentifier,
              } as unknown as RunHandleFromTypes<InferRunTypes<TTask>>;

              stubTriggerLog.trace(
                  { taskIdentifier, payload, returnValue: handle },
                  "Triggered task",
              );

              return handle;
          }
        : tasks.trigger;

export type ScheduledDbReminder = {
    reminder: DbReminder;
    handle: EmailReminderRunHandle;
};

export function cancelReminder(
    runId: string,
): TE.TaskEither<CancelReminderError, void> {
    return TE.tryCatch(
        () => cancelRun(runId).then(() => undefined),
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
                triggerTask<typeof emailReminderTask>("email-reminder", {
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
