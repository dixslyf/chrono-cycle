import { pipe } from "fp-ts/lib/function";
import * as TE from "fp-ts/TaskEither";

import { Project, toProject } from "@/common/data/domain";
import {
    AssertionError,
    DoesNotExistError,
    DuplicateNameError,
    InternalError,
    MalformedTimeStringError,
} from "@/common/errors";

import { decodeProjectTemplateId } from "@/lib/identifiers";
import { scheduleReminders } from "@/lib/reminders";

import { getDb } from "@/db";
import { createProject } from "@/db/queries/projects/create";
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
    | InternalError,
    Project
> {
    return pipe(
        TE.fromTask(getDb),
        TE.chain((db) =>
            wrapWithTransaction(db, (tx) =>
                pipe(
                    TE.Do,
                    TE.bind("dbProj", () => {
                        const { projectTemplateId, ...rest } = payloadP;
                        return createProject(tx, {
                            userId,
                            projectTemplateId:
                                decodeProjectTemplateId(projectTemplateId),
                            ...rest,
                        });
                    }),
                    TE.bind("project", ({ dbProj }) =>
                        TE.right(toProject(dbProj)),
                    ),
                    TE.bindW("reminderHandles", ({ project }) =>
                        scheduleReminders(project),
                    ),
                    TE.mapError((err) =>
                        err._errorKind === "ScheduleReminderError"
                            ? InternalError("Failed to schedule reminders")
                            : err,
                    ),
                    TE.map(({ project }) => project),
                ),
            ),
        ),
    );
}
