import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
    boolean,
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

import eventTemplates from "./eventTemplates";
import eventTypeEnum from "./eventType";
import projects from "./projects";
import { DbReminder, DbReminderInsert } from "./reminders";
import { DbTag, DbTagInsert } from "./tags";

export const statusEnum = pgEnum("status", [
    "none",
    "not started",
    "in progress",
    "completed",
]);

export const events = pgTable("events", {
    id: serial("id").primaryKey().unique(),
    projectId: integer("project_id")
        .notNull()
        .references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    offsetDays: integer("offset_days").notNull(),
    duration: integer("duration").notNull(),
    note: text("note").notNull().default(""),
    eventType: eventTypeEnum("event_type").notNull(),
    autoReschedule: boolean("auto_reschedule").notNull().default(true),
    updatedAt: timestamp("created_at", {
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
});

export type DbEvent = InferSelectModel<typeof events>;
export type DbEventInsert = InferInsertModel<typeof events>;

export type DbExpandedEvent = {
    reminders: DbReminder[];
    tags: DbTag[];
} & DbEvent;

export type DbExpandedEventInsert = {
    reminders: DbReminderInsert[];
    tags: DbTagInsert[];
} & DbEvent;

export const eventSelectSchema = createSelectSchema(events);
export const eventInsertSchema = createInsertSchema(events);
export const eventUpdateSchema = createUpdateSchema(events);

export default events;
