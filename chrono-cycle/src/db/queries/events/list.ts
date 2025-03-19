import { eq, getTableColumns } from "drizzle-orm";
import { pipe } from "fp-ts/function";
import * as NEA from "fp-ts/NonEmptyArray";
import * as R from "fp-ts/Record";
import * as TE from "fp-ts/TaskEither";

import { AssertionError, DoesNotExistError } from "@/common/errors";

import { DbLike } from "@/db";
import { retrieveProject } from "@/db/queries/projects/retrieve";
import { DbReminder, DbTag, eventTags, reminders, tags } from "@/db/schema";
import { DbEvent, DbExpandedEvent, events } from "@/db/schema/events";

// Combination of DbEvent, DbTag and DbReminder.
type DbFatEvent = {
    userId: number;
    tagId: number | null;
    tagName: string | null;
    rId: number | null;
    rTriggerTime: Date | null;
    rEmailNotifications: boolean | null;
    rDesktopNotifications: boolean | null;
    rRtId: number | null;
} & DbEvent;

function retrieveFatEvents(
    db: DbLike,
    userId: number,
    projectId: number,
): TE.TaskEither<AssertionError | DoesNotExistError, DbFatEvent[]> {
    return pipe(
        // Check that the project exists.
        retrieveProject(db, userId, projectId),
        TE.chain(() =>
            TE.fromTask(() =>
                db
                    .select({
                        ...getTableColumns(events),

                        // Tag attributes
                        tagId: tags.id,
                        tagName: tags.name,

                        // Reminder attributes
                        rId: reminders.id,
                        rTriggerTime: reminders.triggerTime,
                        rEmailNotifications: reminders.emailNotifications,
                        rDesktopNotifications: reminders.desktopNotifications,
                        rRtId: reminders.reminderTemplateId,
                    })
                    .from(events)

                    // Join with tag tables.
                    // Must be a left join since we want to get the event  even if it doesn't have any tags.
                    .leftJoin(eventTags, eq(events.id, eventTags.eventId))
                    .leftJoin(tags, eq(eventTags.tagId, tags.id))

                    // Join with reminder table.
                    .leftJoin(reminders, eq(reminders.eventId, events.id))
                    .where(eq(events.projectId, projectId)),
            ),
        ),
        // Add the userId.
        TE.map((rows) =>
            rows.map(
                (row) =>
                    ({
                        userId,
                        ...row,
                    }) satisfies DbFatEvent,
            ),
        ),
    );
}

// Process the rows returned by the `retrieveFatEvents()`.
function processFatEvents(rows: DbFatEvent[]): DbExpandedEvent[] {
    if (rows.length === 0) {
        return [];
    }

    // Group the rows by event ID.
    // encodedId: rows
    const groups = pipe(
        rows,
        NEA.groupBy((row) => String(row.id)),
    );

    const eventMap = pipe(
        groups,
        R.mapWithIndex((eventIdStr, group) => {
            // Use maps to keep track of whether we've seen a tag or reminder.
            const reminderMap = new Map<number, DbReminder>();
            const tagMap = new Map<number, DbTag>();

            for (const row of group) {
                if (row.rId && !reminderMap.has(row.rId)) {
                    // Encountered new reminder.

                    // Safety: reminder attributes are guaranteed to be non-null since rtId is non-null.
                    reminderMap.set(row.rId, {
                        id: row.rId,
                        eventId: Number(eventIdStr),
                        triggerTime: row.rTriggerTime as Date,
                        emailNotifications: row.rEmailNotifications as boolean,
                        desktopNotifications:
                            row.rDesktopNotifications as boolean,
                        reminderTemplateId: row.rRtId,
                    });
                }

                if (row.tagId && !tagMap.has(row.tagId)) {
                    // Encountered new tag.

                    // Safety: tagName is guaranteed to be non-null since tagId is non-null.
                    tagMap.set(row.tagId, {
                        id: row.tagId,
                        userId: row.userId,
                        name: row.tagName as string,
                    });
                }
            }

            // For grabbing the actual event properties.
            // `group[0]`
            const dbEvent = group[0];
            return {
                id: Number(eventIdStr),
                name: dbEvent.name,
                startDate: dbEvent.startDate,
                duration: dbEvent.duration,
                note: dbEvent.note,
                eventType: dbEvent.eventType,
                autoReschedule: dbEvent.autoReschedule,
                projectId: dbEvent.projectId,
                updatedAt: dbEvent.updatedAt,
                status: dbEvent.status,
                notificationsEnabled: dbEvent.notificationsEnabled,
                eventTemplateId: dbEvent.eventTemplateId,
                reminders: Array.from(reminderMap.values()),
                tags: Array.from(tagMap.values()),
            } satisfies DbExpandedEvent;
        }),
    );

    return Object.values(eventMap);
}

export function listEvents(
    db: DbLike,
    userId: number,
    projectId: number,
): TE.TaskEither<AssertionError | DoesNotExistError, DbExpandedEvent[]> {
    return pipe(
        retrieveFatEvents(db, userId, projectId),
        TE.map((rows) => processFatEvents(rows)),
    );
}
