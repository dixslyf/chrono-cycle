import { eq, getTableColumns } from "drizzle-orm";
import { pipe } from "fp-ts/function";
import * as NEA from "fp-ts/NonEmptyArray";
import * as R from "fp-ts/Record";
import * as TE from "fp-ts/TaskEither";

import { AssertionError, DoesNotExistError } from "@/common/errors";

import { DbLike } from "@/db";
import { retrieveProjectTemplate } from "@/db/queries/project-templates/retrieve";
import {
    DbReminderTemplate,
    DbTag,
    eventTemplateTags,
    reminderTemplates,
    tags,
} from "@/db/schema";
import {
    DbEventTemplate,
    DbExpandedEventTemplate,
    eventTemplates,
} from "@/db/schema/eventTemplates";

// Combination of DbEventTemplate, DbTag and DbReminderTemplate.
type DbFatEventTemplate = {
    userId: number;
    tagId: number | null;
    tagName: string | null;
    rtId: number | null;
    rtDaysBeforeEvent: number | null;
    rtTime: string | null;
    rtEmailNotifications: boolean | null;
    rtDesktopNotifications: boolean | null;
} & DbEventTemplate;

function retrieveFatEventTemplates(
    db: DbLike,
    userId: number,
    projectTemplateId: number,
): TE.TaskEither<AssertionError | DoesNotExistError, DbFatEventTemplate[]> {
    return pipe(
        // Check that the project template exists.
        retrieveProjectTemplate(db, userId, projectTemplateId),
        TE.chain(() =>
            TE.fromTask(() =>
                db
                    .select({
                        ...getTableColumns(eventTemplates),

                        // Tag attributes
                        tagId: tags.id,
                        tagName: tags.name,

                        // Reminder template attributes
                        rtId: reminderTemplates.id,
                        rtDaysBeforeEvent: reminderTemplates.daysBeforeEvent,
                        rtTime: reminderTemplates.time,
                        rtEmailNotifications:
                            reminderTemplates.emailNotifications,
                        rtDesktopNotifications:
                            reminderTemplates.desktopNotifications,
                    })
                    .from(eventTemplates)

                    // Join with tag tables.
                    // Must be a left join since we want to get the event template even if it doesn't have any tags.
                    .leftJoin(
                        eventTemplateTags,
                        eq(
                            eventTemplates.id,
                            eventTemplateTags.eventTemplateId,
                        ),
                    )
                    .leftJoin(tags, eq(eventTemplateTags.tagId, tags.id))

                    // Join with reminder template table.
                    .leftJoin(
                        reminderTemplates,
                        eq(
                            reminderTemplates.eventTemplateId,
                            eventTemplates.id,
                        ),
                    )
                    .where(
                        eq(eventTemplates.projectTemplateId, projectTemplateId),
                    ),
            ),
        ),
        // Add the userId.
        TE.map((rows) =>
            rows.map(
                (row) =>
                    ({
                        userId,
                        ...row,
                    }) satisfies DbFatEventTemplate,
            ),
        ),
    );
}

// Process the rows returned by the `retrieveFatEventTemplates()`.
function processFatEventTemplates(
    rows: DbFatEventTemplate[],
): DbExpandedEventTemplate[] {
    if (rows.length === 0) {
        return [];
    }

    // Group the rows by event template ID.
    // encodedId: rows
    const groups = pipe(
        rows,
        NEA.groupBy((row) => String(row.id)),
    );

    const etMap = pipe(
        groups,
        R.mapWithIndex((etIdStr, group) => {
            // Use maps to keep track of whether we've seen a tag or reminder template.
            const rtMap = new Map<number, DbReminderTemplate>();
            const tagMap = new Map<number, DbTag>();

            for (const row of group) {
                if (row.rtId && !rtMap.has(row.rtId)) {
                    // Encountered new reminder template.

                    // Safety: rt attributes are guaranteed to be non-null since rtId is non-null.
                    rtMap.set(row.rtId, {
                        id: row.rtId,
                        eventTemplateId: Number(etIdStr),
                        daysBeforeEvent: row.rtDaysBeforeEvent as number,
                        time: row.rtTime as string,
                        emailNotifications: row.rtEmailNotifications as boolean,
                        desktopNotifications:
                            row.rtDesktopNotifications as boolean,
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

            // For grabbing the actual event template properties.
            // `group[0]`
            const dbEt = group[0];
            return {
                id: Number(etIdStr),
                name: dbEt.name,
                offsetDays: dbEt.offsetDays,
                duration: dbEt.duration,
                note: dbEt.note,
                eventType: dbEt.eventType,
                autoReschedule: dbEt.autoReschedule,
                projectTemplateId: dbEt.projectTemplateId,
                updatedAt: dbEt.updatedAt,
                reminders: Array.from(rtMap.values()),
                tags: Array.from(tagMap.values()),
            } satisfies DbExpandedEventTemplate;
        }),
    );

    return Object.values(etMap);
}

export function listExpandedEventTemplates(
    db: DbLike,
    userId: number,
    projectTemplateId: number,
): TE.TaskEither<
    AssertionError | DoesNotExistError,
    DbExpandedEventTemplate[]
> {
    return pipe(
        retrieveFatEventTemplates(db, userId, projectTemplateId),
        TE.map((rows) => processFatEventTemplates(rows)),
    );
}
