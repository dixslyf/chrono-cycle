import { eq, and, getTableColumns } from "drizzle-orm";
import * as TE from "fp-ts/TaskEither";
import * as R from "fp-ts/Record";
import * as NEA from "fp-ts/NonEmptyArray";
import { pipe } from "fp-ts/function";
import { ListError, ListResult } from "./data";
import {
    DbEventTemplate,
    eventTemplates,
} from "@/server/db/schema/eventTemplates";
import { EventTemplate, ReminderTemplate, Tag } from "@/server/common/data";
import {
    decodeProjectTemplateId,
    encodeEventTemplateId,
    encodeProjectTemplateId,
    encodeReminderTemplateId,
    encodeTagId,
} from "@/server/common/identifiers";
import {
    DbProjectTemplate,
    eventTemplateTags,
    projectTemplates,
    reminderTemplates,
    tags,
} from "@/server/db/schema";
import getFuncDb, { FunctionalDatabase } from "@/server/db/functional";

// Check if the project template exists.
function checkProjectTemplateTask(
    fDb: FunctionalDatabase,
    userId: number,
    projectTemplateId: number,
): TE.TaskEither<ListError, DbProjectTemplate[]> {
    return fDb.do((db) =>
        db
            .select()
            .from(projectTemplates)
            .where(
                and(
                    eq(projectTemplates.id, projectTemplateId),
                    eq(projectTemplates.userId, userId),
                ),
            ),
    );
}

type SelectRow = {
    tagId: number | null;
    tagName: string | null;
    rtId: number | null;
    rtDaysBeforeEvent: number | null;
    rtTime: string | null;
    rtEmailNotifications: boolean | null;
    rtDesktopNotifications: boolean | null;
} & DbEventTemplate;

// Retrieve the event templates for the project template.
function selectEventTemplatesTask(
    fDb: FunctionalDatabase,
    projectTemplateId: number,
): TE.TaskEither<ListError, SelectRow[]> {
    return pipe(
        fDb.do((db) =>
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
                    rtEmailNotifications: reminderTemplates.emailNotifications,
                    rtDesktopNotifications:
                        reminderTemplates.desktopNotifications,
                })
                .from(eventTemplates)

                // Join with tag tables.
                // Must be a left join since we want to get the event template even if it doesn't have any tags.
                .leftJoin(
                    eventTemplateTags,
                    eq(eventTemplates.id, eventTemplateTags.eventTemplateId),
                )
                .leftJoin(tags, eq(eventTemplateTags.tagId, tags.id))

                // Join with reminder template table.
                .leftJoin(
                    reminderTemplates,
                    eq(reminderTemplates.eventTemplateId, eventTemplates.id),
                )
                .where(eq(eventTemplates.projectTemplateId, projectTemplateId)),
        ),
        TE.mapError((err) => err satisfies ListError as ListError),
    );
}

// Process the rows returned by the select query.
function processRows(rows: SelectRow[]): EventTemplate[] {
    if (rows.length === 0) {
        return [];
    }

    // Group the rows by event template (encoded) ID.
    // encodedId: rows
    const groups = pipe(
        rows,
        NEA.groupBy((row) => encodeEventTemplateId(row.id)),
    );

    const etMap = pipe(
        groups,
        R.mapWithIndex((sqid, group) => {
            // Use maps to keep track of whether we've seen a tag or reminder template.
            const rtMap = new Map<number, ReminderTemplate>();
            const tagMap = new Map<number, Tag>();

            for (const row of group) {
                if (row.rtId && !rtMap.has(row.rtId)) {
                    // Encountered new reminder template.

                    // Safety: rt attributes are guaranteed to be non-null since rtId is non-null.
                    rtMap.set(row.rtId, {
                        id: encodeReminderTemplateId(row.rtId),
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
                        id: encodeTagId(row.tagId),
                        name: row.tagName as string,
                    });
                }
            }

            // For grabbing the actual event template properties.
            // `group[0]`
            const dbEt = group[0];
            return {
                id: sqid,
                name: dbEt.name,
                offsetDays: dbEt.offsetDays,
                duration: dbEt.duration,
                note: dbEt.note,
                eventType: dbEt.eventType,
                autoReschedule: dbEt.autoReschedule,
                projectTemplateId: encodeProjectTemplateId(
                    dbEt.projectTemplateId,
                ),
                updatedAt: dbEt.updatedAt,
                reminders: Array.from(rtMap.values()),
                tags: Array.from(tagMap.values()),
            } satisfies EventTemplate;
        }),
    );

    return Object.values(etMap);
}

export async function listEventTemplates(
    userId: number,
    projectTemplateSqid: string,
): Promise<ListResult> {
    const fDb = await getFuncDb();

    const projectTemplateId = decodeProjectTemplateId(projectTemplateSqid);

    const task = pipe(
        checkProjectTemplateTask(fDb, userId, projectTemplateId),
        TE.chain(() => selectEventTemplatesTask(fDb, projectTemplateId)),
        TE.map((rows) => processRows(rows)),
    );
    return await task();
}
