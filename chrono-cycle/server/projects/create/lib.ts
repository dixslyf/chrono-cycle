import { and, eq } from "drizzle-orm";
import * as TE from "fp-ts/TaskEither";
import * as NEA from "fp-ts/NonEmptyArray";
import { pipe } from "fp-ts/function";

import { CreateError, CreateFormData, CreateResult } from "./data";
import { EventTemplate, Event, Project, Reminder } from "@/server/common/data";
import {
    DbEvent,
    DbEventTagInsert,
    DbProject,
    DbProjectInsert,
    DbReminder,
    DbReminderInsert,
    events as eventsTable,
    eventTags as eventTagsTable,
    projects as projectsTable,
    reminders as remindersTable,
} from "@/server/db/schema";
import getFuncDb, { FunctionalDatabase } from "@/server/db/functional";
import { DuplicateNameError } from "@/server/common/errors";
import {
    decodeEventTemplateId,
    decodeProjectTemplateId,
    decodeReminderTemplateId,
    decodeTagId,
    encodeEventId,
    encodeEventTemplateId,
    encodeProjectId,
    encodeReminderId,
    encodeReminderTemplateId,
} from "@/server/common/identifiers";
import { listEventTemplates } from "@/server/event-templates/list/lib";
import { DbLike } from "@/server/db";

function checkDuplicateNameTask(
    fDb: FunctionalDatabase,
    userId: number,
    name: string,
): TE.TaskEither<CreateError, void> {
    return pipe(
        fDb.do((db) =>
            db
                .select()
                .from(projectsTable)
                .where(
                    and(
                        eq(projectsTable.userId, userId),
                        eq(projectsTable.name, name),
                    ),
                ),
        ),
        TE.mapError((err) => err satisfies CreateError as CreateError),
        TE.map((selected) => selected.length > 0),
        TE.chain((isDuplicate) =>
            isDuplicate ? TE.left(DuplicateNameError()) : TE.right(undefined),
        ),
    );
}

async function insertProject(
    db: DbLike,
    userId: number,
    data: CreateFormData,
): Promise<DbProject> {
    return (
        await db
            .insert(projectsTable)
            .values({
                userId,
                name: data.name,
                description: data.description,
                startsAt: data.startsAt,
                projectTemplateId: decodeProjectTemplateId(
                    data.projectTemplateId,
                ),
            } satisfies DbProjectInsert)
            .returning()
    )[0];
}

async function insertEvents(
    db: DbLike,
    ets: EventTemplate[],
    projectId: number,
): Promise<DbEvent[]> {
    return await db
        .insert(eventsTable)
        .values(
            ets.map((et) => ({
                projectId: projectId,
                name: et.name,
                offsetDays: et.offsetDays,
                duration: et.duration,
                note: et.note,
                eventType: et.eventType,
                autoReschedule: et.autoReschedule,
                eventTemplateId: decodeEventTemplateId(et.id),
            })),
        )
        .returning();
}

async function linkTags(
    db: DbLike,
    etsMap: Map<number, EventTemplate>,
    dbEvents: DbEvent[],
): Promise<void> {
    const eventTagsToInsert = dbEvents
        .map((event) => {
            // Safety: Since we inserted the events based on the list of event templates,
            // `et` should never be undefined. Same for `event.eventTemplateId`.
            const et = etsMap.get(
                event.eventTemplateId as number,
            ) as EventTemplate;

            const toInsert = et.tags.map(
                (tag) =>
                    ({
                        eventId: event.id,
                        tagId: decodeTagId(tag.id),
                    }) satisfies DbEventTagInsert,
            );

            return toInsert;
        })
        .flat();

    await db.insert(eventTagsTable).values(eventTagsToInsert);
}

async function insertReminders(
    db: DbLike,
    etsMap: Map<number, EventTemplate>,
    dbEvents: DbEvent[],
) {
    const remindersToInsert = dbEvents
        .map((event) => {
            // Safety: Since we inserted the events based on the list of event templates,
            // `et` should never be undefined. Same for `event.eventTemplateId`.
            const et = etsMap.get(
                event.eventTemplateId as number,
            ) as EventTemplate;

            const toInsert = et.reminders.map(
                (rt) =>
                    ({
                        eventId: event.id,
                        daysBeforeEvent: rt.daysBeforeEvent,
                        time: rt.time,
                        emailNotifications: rt.emailNotifications,
                        desktopNotifications: rt.desktopNotifications,
                        reminderTemplateId: decodeReminderTemplateId(rt.id),
                    }) satisfies DbReminderInsert,
            );

            return toInsert;
        })
        .flat();

    return await db
        .insert(remindersTable)
        .values(remindersToInsert)
        .returning();
}

function constructEventsList(
    dbEvents: DbEvent[],
    dbReminders: DbReminder[],
    etsMap: Map<number, EventTemplate>,
): Event[] {
    const eventDbRemindersMap = pipe(
        dbReminders,
        NEA.groupBy((dbReminder) => encodeEventId(dbReminder.eventId)),
    );

    return dbEvents.map((dbEvent) => {
        const { id: dbId, eventTemplateId, projectId, ...rest } = dbEvent;
        const id = encodeEventId(dbId);

        const reminders =
            eventDbRemindersMap[id].map((dbReminder) => {
                const {
                    id: dbId,
                    reminderTemplateId: dbReminderTemplateId,
                    ...rest
                } = dbReminder;
                return {
                    id: encodeReminderId(dbId),
                    reminderTemplateId: dbReminderTemplateId
                        ? encodeReminderTemplateId(dbReminderTemplateId)
                        : null,
                    ...rest,
                } satisfies Reminder;
            }) ?? [];

        // Safety: As before, since we constructed the event from the event template,
        // the ID and event template are guaranteed to be defined.
        const et = etsMap.get(
            dbEvent.eventTemplateId as number,
        ) as EventTemplate;

        return {
            id,
            eventTemplateId: eventTemplateId
                ? encodeEventTemplateId(eventTemplateId)
                : null,
            projectId: encodeProjectId(projectId),
            ...rest,
            reminders,
            tags: et.tags,
        } satisfies Event;
    });
}

function insertTask(
    fDb: FunctionalDatabase,
    userId: number,
    data: CreateFormData,
    ets: EventTemplate[],
): TE.TaskEither<CreateError, Project> {
    // Map of event template ID: event template.
    const etsMap = new Map(ets.map((et) => [decodeEventTemplateId(et.id), et]));

    return fDb.do((db) =>
        db.transaction(async (tx) => {
            const dbProject = await insertProject(tx, userId, data);
            const dbEvents = await insertEvents(tx, ets, dbProject.id);
            await linkTags(tx, etsMap, dbEvents);
            const dbReminders = await insertReminders(tx, etsMap, dbEvents);

            const events = constructEventsList(dbEvents, dbReminders, etsMap);

            // Construct the `Project`.
            const { id, projectTemplateId, ...rest } = dbProject;
            return {
                id: encodeProjectId(dbProject.id),
                projectTemplateId: data.projectTemplateId,
                events,
                ...rest,
            } satisfies Project;
        }),
    );
}

export async function createProject(
    userId: number,
    data: CreateFormData,
): Promise<CreateResult> {
    const fDb = await getFuncDb();

    const listProjectTemplatesTask = pipe(
        () => listEventTemplates(userId, data.projectTemplateId),
        TE.mapError((err) => err satisfies CreateError as CreateError),
    );

    const task = pipe(
        checkDuplicateNameTask(fDb, userId, data.name),
        TE.chain(() => listProjectTemplatesTask),
        TE.chain((ets) => insertTask(fDb, userId, data, ets)),
    );

    return await task();
}
