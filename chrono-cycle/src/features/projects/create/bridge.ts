import * as A from "fp-ts/Array";
import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";

import { Project, toProject } from "@/common/data/domain";
import {
    AssertionError,
    DoesNotExistError,
    DuplicateNameError,
    InternalError,
    MalformedTimeStringError,
    NoEventTemplatesError,
} from "@/common/errors";

import { decodeProjectTemplateId } from "@/lib/identifiers";
import { scheduleRemindersForProject } from "@/lib/reminders";

import { getDb } from "@/db";
import { listEventTemplates } from "@/db/queries/event-templates/list";
import { createProject } from "@/db/queries/projects/create";
import { updateReminder } from "@/db/queries/reminders/update";
import { wrapWithTransaction } from "@/db/queries/utils/transaction";

import { ParsedPayload } from "./data";

export function bridge(
    userId: number,
    payloadP: ParsedPayload,
): TE.TaskEither<
    | DuplicateNameError
    | AssertionError
    | DoesNotExistError
    | MalformedTimeStringError
    | NoEventTemplatesError
    | InternalError,
    Project
> {
    const projectTemplateId = decodeProjectTemplateId(
        payloadP.projectTemplateId,
    );
    return pipe(
        TE.fromTask(getDb),
        TE.chain((db) =>
            wrapWithTransaction(db, (tx) =>
                pipe(
                    TE.Do,
                    TE.bindW("dbProj", () => {
                        const { projectTemplateId: _, ...rest } = payloadP;
                        return createProject(tx, {
                            userId,
                            projectTemplateId,
                            ...rest,
                        });
                    }),
                    TE.tap(() =>
                        // Check that the project template has event templates.
                        // If this fails, the transaction will rollback and undo
                        // the project creation above.
                        pipe(
                            listEventTemplates(tx, userId, projectTemplateId),
                            TE.mapError((err) =>
                                err._errorKind === "DoesNotExistError"
                                    ? NoEventTemplatesError()
                                    : err,
                            ),
                        ),
                    ),
                    // Schedule the reminders.
                    TE.bindW("scheduledDbReminders", ({ dbProj }) =>
                        scheduleRemindersForProject(dbProj),
                    ),
                    // Save the scheduled reminder handles to the database.
                    TE.tap(({ scheduledDbReminders }) =>
                        pipe(
                            scheduledDbReminders,
                            A.traverse(TE.ApplicativePar)(
                                (scheduledDbReminder) =>
                                    updateReminder(tx, {
                                        id: scheduledDbReminder.reminder.id,
                                        triggerRunId:
                                            scheduledDbReminder.handle.id,
                                    }),
                            ),
                        ),
                    ),
                    // Map reminder errors to `InternalError` since the client shouldn't
                    // need to know about it.
                    TE.mapError((err) =>
                        err._errorKind === "ScheduleReminderError"
                            ? InternalError("Failed to schedule reminders")
                            : err._errorKind === "CancelReminderError"
                              ? InternalError("Failed to cancel reminders")
                              : err,
                    ),
                    TE.map(({ dbProj }) => toProject(dbProj)),
                ),
            ),
        ),
    );
}
