import * as A from "fp-ts/Array";
import { pipe } from "fp-ts/function";
import * as TE from "fp-ts/TaskEither";

import { ProjectTemplate, toProjectTemplate } from "@/common/data/domain";
import {
    AssertionError,
    DoesNotExistError,
    DuplicateNameError,
} from "@/common/errors";

import { DbLike, getDb } from "@/db";
import { createEventTemplate } from "@/db/queries/event-templates/create";
import { createProjectTemplate } from "@/db/queries/project-templates/create";
import { wrapWithTransaction } from "@/db/queries/utils/transaction";
import { DbExpandedEventTemplateInsert } from "@/db/schema";

import { ParsedPayload } from "./data";

function unsafeBridge(
    db: DbLike,
    userId: number,
    payloadP: ParsedPayload,
): TE.TaskEither<
    DuplicateNameError | AssertionError | DoesNotExistError,
    ProjectTemplate
> {
    return pipe(
        TE.Do,
        TE.bindW("pt", () =>
            createProjectTemplate(db, {
                userId,
                name: payloadP.name,
                description: payloadP.description,
            }),
        ),
        TE.bindW("ets", ({ pt }) =>
            pipe(
                payloadP.events.map(
                    (event) =>
                        ({
                            name: event.name,
                            offsetDays: event.offsetDays,
                            duration: event.duration,
                            eventType: event.eventType,
                            autoReschedule: event.autoReschedule,
                            reminders: event.reminders,
                            note: event.note,
                            tags: event.tags.map((tagName) => ({
                                userId,
                                name: tagName,
                            })),
                            projectTemplateId: pt.id,
                        }) satisfies DbExpandedEventTemplateInsert,
                ),
                A.traverse(TE.ApplicativePar)((event) =>
                    createEventTemplate(db, userId, event),
                ),
            ),
        ),
        TE.map(({ pt, ets }) => toProjectTemplate({ ...pt, events: ets })),
    );
}

export function bridge(
    userId: number,
    payloadP: ParsedPayload,
): TE.TaskEither<
    DuplicateNameError | AssertionError | DoesNotExistError,
    ProjectTemplate
> {
    return pipe(
        TE.fromTask(getDb),
        TE.chain((db) =>
            wrapWithTransaction(db, (tx) => unsafeBridge(tx, userId, payloadP)),
        ),
    );
}
