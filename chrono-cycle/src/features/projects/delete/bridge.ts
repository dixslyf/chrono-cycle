import * as A from "fp-ts/Array";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";

import {
    AssertionError,
    DoesNotExistError,
    InternalError,
} from "@/common/errors";

import { decodeProjectId } from "@/lib/identifiers";
import { cancelReminder } from "@/lib/reminders";

import { getDb } from "@/db";
import { deleteProject } from "@/db/queries/projects/delete";
import { retrieveExpandedProject } from "@/db/queries/projects/retrieveExpanded";

import { ParsedPayload } from "./data";

export function bridge(
    userId: number,
    payloadP: ParsedPayload,
): TE.TaskEither<AssertionError | DoesNotExistError | InternalError, void> {
    const projectId = decodeProjectId(payloadP.projectId);
    return pipe(
        TE.Do,
        TE.bind("db", () => TE.fromTask(getDb)),

        // Retrieve the expanded project so we can access
        // the reminder data for cancellation.
        TE.bind("dbExpandedProject", ({ db }) =>
            retrieveExpandedProject(db, userId, projectId),
        ),

        // Delete the project from the database.
        TE.tap(({ db }) => deleteProject(db, userId, projectId)),

        // Cancel reminder trigger runs.
        TE.tap(({ dbExpandedProject }) =>
            pipe(
                dbExpandedProject.events,
                A.flatMap((event) => event.reminders),
                A.filterMap((reminder) =>
                    reminder.triggerRunId !== null
                        ? O.some(reminder.triggerRunId)
                        : O.none,
                ),
                A.traverse(TE.ApplicativePar)((triggerRunId) =>
                    cancelReminder(triggerRunId),
                ),
            ),
        ),

        // Map reminder cancellation error to internal error since
        // clients don't need to know about it.
        TE.mapError((err) =>
            err._errorKind === "CancelReminderError"
                ? InternalError("Failed to cancel reminders")
                : err,
        ),
        TE.map(() => undefined),
    );
}
