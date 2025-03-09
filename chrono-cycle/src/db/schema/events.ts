import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
    pgTable,
    serial,
    timestamp,
    integer,
    text,
    boolean,
    pgEnum,
} from "drizzle-orm/pg-core";
import eventTypeEnum from "./eventType";
import projects from "./projects";
import eventTemplates from "./eventTemplates";
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from "drizzle-zod";

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

export const eventSelectSchema = createSelectSchema(events);
export const eventInsertSchema = createInsertSchema(events);
export const eventUpdateSchema = createUpdateSchema(events);

export default events;
