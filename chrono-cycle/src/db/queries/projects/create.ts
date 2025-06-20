import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as NEA from "fp-ts/NonEmptyArray";
import * as T from "fp-ts/Task";
import * as TE from "fp-ts/TaskEither";
import { DateTime } from "luxon";

import { extractTimeStringComponents } from "@/common/dates";
import {
    AssertionError,
    DoesNotExistError,
    DuplicateNameError,
    MalformedTimeStringError,
} from "@/common/errors";

import { DbLike } from "@/db";
import { retrieveExpandedEventTemplatesByProjectTemplateId } from "@/db/queries/event-templates/list";
import { retrieveProjectTemplate } from "@/db/queries/project-templates/retrieve";
import { wrapWithTransaction } from "@/db/queries/utils/transaction";
import {
    DbEventInsert,
    DbEventTemplate,
    DbExpandedEvent,
    DbExpandedEventTemplate,
    DbExpandedProject,
    events as eventsTable,
    eventTags as eventTagsTable,
    projects as projectsTable,
    reminders as remindersTable,
    type DbEvent,
    type DbEventTagInsert,
    type DbProject,
    type DbProjectInsert,
    type DbReminder,
    type DbReminderInsert,
} from "@/db/schema";

import { checkDuplicateProjectName } from "./checkDuplicateName";

async function insertProject(
    db: DbLike,
    toInsert: DbProjectInsert,
): Promise<DbProject> {
    return (await db.insert(projectsTable).values(toInsert).returning())[0];
}

async function insertEvents(
    db: DbLike,
    project: DbProject,
    ets: DbEventTemplate[],
): Promise<DbEvent[]> {
    if (ets.length === 0) {
        return [];
    }

    const toInsert = ets.map((et) => {
        const { id: eventTemplateId, updatedAt: _, offsetDays, ...rest } = et;
        const startDate = new Date(project.startsAt.getTime());
        startDate.setDate(startDate.getDate() + offsetDays);
        return {
            projectId: project.id,
            eventTemplateId,
            startDate,
            status: et.eventType === "task" ? "not started" : "none",
            ...rest,
        } satisfies DbEventInsert;
    });
    return await db.insert(eventsTable).values(toInsert).returning();
}

async function linkTags(
    db: DbLike,
    etsMap: Map<number, DbExpandedEventTemplate>,
    dbEvents: DbEvent[],
): Promise<void> {
    if (dbEvents.length === 0 || etsMap.size === 0) {
        return;
    }

    const eventTagsToInsert = dbEvents
        .map((event) => {
            // Safety: Since we inserted the events based on the list of event templates,
            // `et` should never be undefined. Same for `event.eventTemplateId`.
            const et = etsMap.get(
                event.eventTemplateId as number,
            ) as DbExpandedEventTemplate;

            const toInsert = et.tags.map(
                (tag) =>
                    ({
                        eventId: event.id,
                        tagId: tag.id,
                    }) satisfies DbEventTagInsert,
            );

            return toInsert;
        })
        .flat();

    if (eventTagsToInsert.length === 0) {
        return;
    }
    await db.insert(eventTagsTable).values(eventTagsToInsert);
}

function insertReminders(
    db: DbLike,
    etsMap: Map<number, DbExpandedEventTemplate>,
    dbEvents: DbEvent[],
): TE.TaskEither<MalformedTimeStringError, DbReminder[]> {
    if (dbEvents.length === 0 || etsMap.size === 0) {
        return TE.right([]);
    }

    const remindersToInsert = dbEvents
        .map((event) => {
            // Safety: Since we inserted the events based on the list of event templates,
            // `et` should never be undefined. Same for `event.eventTemplateId`.
            const et = etsMap.get(
                event.eventTemplateId as number,
            ) as DbExpandedEventTemplate;

            const toInsert = et.reminders.map((rt) => {
                // Parse the time and set it on the trigger date.
                const timeCompsResult = extractTimeStringComponents(rt.time);
                return pipe(
                    timeCompsResult,
                    E.match(
                        (err) => E.left(err),
                        (timeComps) => {
                            // Calculate the trigger time.
                            //
                            // HACK: This forces the date to Singapore time for simplicity.
                            const triggerTime = DateTime.fromJSDate(
                                event.startDate,
                            )
                                // At this point, there is no time information, and we are going to override it later,
                                // so we don't have to worry about "converting" the current time.
                                .setZone("Asia/Singapore", {
                                    keepLocalTime: true,
                                })
                                .minus({ days: rt.daysBeforeEvent })
                                .set({
                                    hour: timeComps.hours,
                                    minute: timeComps.minutes,
                                })
                                .toJSDate();

                            return E.right({
                                eventId: event.id,
                                triggerTime,
                                emailNotifications: rt.emailNotifications,
                                desktopNotifications: rt.desktopNotifications,
                                reminderTemplateId: rt.id,
                            } satisfies DbReminderInsert);
                        },
                    ),
                );
            });

            return toInsert;
        })
        .flat();

    if (remindersToInsert.length === 0) {
        return TE.right([]);
    }

    return pipe(
        remindersToInsert,
        A.sequence(E.Applicative),
        TE.fromEither,
        TE.chain((reminders) =>
            TE.fromTask(() =>
                db.insert(remindersTable).values(reminders).returning(),
            ),
        ),
    );
}

function constructExpandedEvents(
    etsMap: Map<number, DbExpandedEventTemplate>,
    events: DbEvent[],
    allReminders: DbReminder[],
): DbExpandedEvent[] {
    // Group the reminders by event.
    const eventRemindersMap = pipe(
        allReminders,
        NEA.groupBy((dbReminder) => String(dbReminder.eventId)),
    );

    return events.map((event) => {
        // Safety: As before, since we constructed the event from the event template,
        // the ID and event template are guaranteed to be defined.
        const et = etsMap.get(
            event.eventTemplateId as number,
        ) as DbExpandedEventTemplate;

        const reminders = eventRemindersMap[String(event.id)] ?? [];
        return {
            ...event,
            reminders,
            tags: et.tags,
        } satisfies DbExpandedEvent;
    });
}

function rawExpandedInsert(
    db: DbLike,
    toInsert: DbProjectInsert,
    ets: DbExpandedEventTemplate[],
): TE.TaskEither<MalformedTimeStringError, DbExpandedProject> {
    // Map of event template ID: event template.
    const etsMap = new Map(ets.map((et) => [et.id, et]));
    return pipe(
        T.Do,
        T.bind("project", () => () => insertProject(db, toInsert)),
        T.bind(
            "events",
            ({ project }) =>
                () =>
                    insertEvents(db, project, ets),
        ),
        T.tap(
            ({ events }) =>
                () =>
                    linkTags(db, etsMap, events),
        ),
        TE.fromTask,
        TE.bind("reminders", ({ events }) =>
            insertReminders(db, etsMap, events),
        ),
        TE.bind("expandedEvents", ({ events, reminders }) =>
            TE.right(constructExpandedEvents(etsMap, events, reminders)),
        ),
        TE.map(
            ({ project, expandedEvents }) =>
                ({
                    ...project,
                    events: expandedEvents,
                }) satisfies DbExpandedProject,
        ),
    );
}

export function createProject(
    db: DbLike,
    toInsert: DbProjectInsert,
): TE.TaskEither<
    | DuplicateNameError
    | AssertionError
    | DoesNotExistError
    | MalformedTimeStringError,
    DbExpandedProject
> {
    return pipe(
        checkDuplicateProjectName(db, toInsert.userId, toInsert.name),
        TE.chainW(() => {
            const projectTemplateId = toInsert.projectTemplateId ?? null;
            // Creating with a template.
            if (projectTemplateId) {
                return pipe(
                    // Check that the project template exists and is owned by the user.
                    retrieveProjectTemplate(
                        db,
                        toInsert.userId,
                        projectTemplateId,
                    ),
                    TE.chain(() =>
                        TE.fromTask(() =>
                            retrieveExpandedEventTemplatesByProjectTemplateId(
                                db,
                                projectTemplateId,
                            ),
                        ),
                    ),
                    TE.chainW((ets) =>
                        wrapWithTransaction(db, (tx) =>
                            rawExpandedInsert(tx, toInsert, ets),
                        ),
                    ),
                );
            }

            // Creating without a template, so no events.
            return TE.fromTask(() =>
                insertProject(db, toInsert).then((proj) => ({
                    events: [],
                    ...proj,
                })),
            );
        }),
    );
}
