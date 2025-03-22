import { InferSelectModel, sql } from "drizzle-orm";
import {
    boolean,
    check,
    date,
    integer,
    pgEnum,
    pgTable,
    serial,
    text,
    timestamp,
} from "drizzle-orm/pg-core";
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

import { eventTemplates } from "./eventTemplates";
import { eventTypeEnum } from "./eventType";
import { projects } from "./projects";
import {
    DbReminder,
    DbReminderInsert,
    DbReminderUpdate,
    reminderInsertSchema,
    reminderUpdateSchema,
} from "./reminders";
import { DbTag, DbTagInsert } from "./tags";

export const statusEnum = pgEnum("status", [
    "none",
    "not started",
    "in progress",
    "completed",
]);

export const events = pgTable(
    "events",
    {
        id: serial("id").primaryKey().unique(),
        projectId: integer("project_id")
            .notNull()
            .references(() => projects.id, { onDelete: "cascade" }),
        name: text("name").notNull(),
        startDate: date("start_date", { mode: "date" }).notNull(),
        duration: integer("duration").notNull(),
        note: text("note").notNull().default(""),
        eventType: eventTypeEnum("event_type").notNull(),
        autoReschedule: boolean("auto_reschedule").notNull().default(true),
        updatedAt: timestamp("updated_at", {
            withTimezone: true,
            mode: "date",
        })
            .notNull()
            .defaultNow(),
        status: statusEnum("status").notNull().default("none"),
        notificationsEnabled: boolean("notifications_enabled")
            .notNull()
            .default(true),
        eventTemplateId: integer("event_template_id").references(
            () => eventTemplates.id,
            { onDelete: "set null" },
        ),
    },
    (t) => [
        check("events_nonempty_name", sql`TRIM(${t.name}) <> ''`),
        check(
            "events_duration_check",
            sql`((${t.eventType} = 'task' AND ${t.duration} = 1) OR (${t.eventType} = 'activity' AND ${t.duration} >= 1))`,
        ),
        check(
            "events_status_check",
            sql`((${t.eventType} = 'task' AND ${t.status} <> 'none') OR (${t.eventType} = 'activity' AND ${t.status} = 'none'))`,
        ),
    ],
);

export type DbEvent = InferSelectModel<typeof events>;
export type DbEventInsert = z.input<typeof eventInsertSchema>;
export type DbEventUpdate = z.input<typeof eventUpdateSchema>;

export type DbExpandedEvent = {
    reminders: DbReminder[];
    tags: DbTag[];
} & DbEvent;

export type DbExpandedEventInsert = {
    reminders: DbReminderInsert[];
    tags: DbTagInsert[];
} & DbEvent;

export type DbExpandedEventUpdate = DbEventUpdate & {
    remindersDelete: number[];
    remindersUpdate: DbReminderUpdate[];
    remindersInsert: Omit<DbReminderInsert, "eventId">[];
};

export const eventSelectSchema = createSelectSchema(events);

export const eventInsertSchema = createInsertSchema(events, {
    name: (schema) => schema.nonempty(),
})
    .omit({ updatedAt: true })
    .refine(
        (val) => (val.eventType === "task" ? val.duration === 1 : true),
        "Tasks must have a duration of 1",
    )
    .refine(
        (val) => (val.eventType === "activity" ? val.duration >= 1 : true),
        "Activities must have a duration of at least 1",
    )
    .refine(
        (val) => (val.eventType === "task" ? val.status !== "none" : true),
        "Status must not be 'none' for tasks.",
    )
    .refine(
        (val) => (val.eventType === "activity" ? val.status === "none" : true),
        "Status must be 'none' for activities.",
    );

export const eventUpdateSchema = createUpdateSchema(events, {
    name: (schema) => schema.nonempty(),
})
    .omit({ eventType: true, projectId: true, eventTemplateId: true })
    .required({ id: true });

export const expandedEventUpdateSchema = eventUpdateSchema.extend({
    remindersDelete: z.array(z.number()),
    remindersUpdate: z.array(reminderUpdateSchema),
    remindersInsert: z.array(reminderInsertSchema),
});
