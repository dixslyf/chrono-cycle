import { pipe } from "fp-ts/function";
import * as NEA from "fp-ts/NonEmptyArray";
import * as T from "fp-ts/Task";
import * as TE from "fp-ts/TaskEither";

import {
    AssertionError,
    DoesNotExistError,
    DuplicateNameError,
} from "@/common/errors";

import { DbLike } from "@/db";
import { listEventTemplates } from "@/db/queries/event-templates/list";
import { wrapWithTransaction } from "@/db/queries/utils/transaction";
import {
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
    projectId: number,
    ets: DbEventTemplate[],
): Promise<DbEvent[]> {
    if (ets.length === 0) {
        return [];
    }

    const toInsert = ets.map((et) => {
        const { id: eventTemplateId, updatedAt, ...rest } = et;
        return { projectId, eventTemplateId, ...rest };
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

async function insertReminders(
    db: DbLike,
    etsMap: Map<number, DbExpandedEventTemplate>,
    dbEvents: DbEvent[],
): Promise<DbReminder[]> {
    if (dbEvents.length === 0 || etsMap.size === 0) {
        return [];
    }

    const remindersToInsert = dbEvents
        .map((event) => {
            // Safety: Since we inserted the events based on the list of event templates,
            // `et` should never be undefined. Same for `event.eventTemplateId`.
            const et = etsMap.get(
                event.eventTemplateId as number,
            ) as DbExpandedEventTemplate;

            const toInsert = et.reminders.map(
                (rt) =>
                    ({
                        eventId: event.id,
                        daysBeforeEvent: rt.daysBeforeEvent,
                        time: rt.time,
                        emailNotifications: rt.emailNotifications,
                        desktopNotifications: rt.desktopNotifications,
                        reminderTemplateId: rt.id,
                    }) satisfies DbReminderInsert,
            );

            return toInsert;
        })
        .flat();

    if (remindersToInsert.length === 0) {
        return [];
    }

    return await db
        .insert(remindersTable)
        .values(remindersToInsert)
        .returning();
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
): T.Task<DbExpandedProject> {
    // Map of event template ID: event template.
    const etsMap = new Map(ets.map((et) => [et.id, et]));
    return pipe(
        T.Do,
        T.bind("project", () => () => insertProject(db, toInsert)),
        T.bind(
            "events",
            ({ project }) =>
                () =>
                    insertEvents(db, project.id, ets),
        ),
        T.tap(
            ({ events }) =>
                () =>
                    linkTags(db, etsMap, events),
        ),
        T.bind(
            "reminders",
            ({ events }) =>
                () =>
                    insertReminders(db, etsMap, events),
        ),
        T.bind("expandedEvents", ({ events, reminders }) =>
            T.of(constructExpandedEvents(etsMap, events, reminders)),
        ),
        T.map(
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
    DuplicateNameError | AssertionError | DoesNotExistError,
    DbExpandedProject
> {
    return pipe(
        checkDuplicateProjectName(db, toInsert.userId, toInsert.name),
        TE.chainW(() =>
            toInsert.projectTemplateId
                ? // Creating with a template.
                  pipe(
                      listEventTemplates(
                          db,
                          toInsert.userId,
                          toInsert.projectTemplateId,
                      ),
                      TE.chain((ets) =>
                          wrapWithTransaction(db, (tx) =>
                              TE.fromTask(rawExpandedInsert(tx, toInsert, ets)),
                          ),
                      ),
                  )
                : // Creating without a template, so no events.
                  TE.fromTask(() =>
                      insertProject(db, toInsert).then((proj) => ({
                          events: [],
                          ...proj,
                      })),
                  ),
        ),
    );
}
