import { InferSelectModel } from "drizzle-orm";
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
        .references(() => projects.id),
    name: text("name").notNull(),
    offsetDays: integer("offset_days").notNull(),
    duration: integer("duration").notNull(),
    note: text("note"),
    eventType: eventTypeEnum("event_type").notNull(),
    autoReschedule: boolean("auto_reschedule").notNull(),
    updatedAt: timestamp("created_at", {
        withTimezone: true,
        mode: "date",
    })
        .notNull()
        .defaultNow(),
    status: statusEnum("status").notNull(),
    notificationsEnabled: boolean("notifications_enabled").notNull(),
    eventTemplateId: integer("event_template_id").references(
        () => eventTemplates.id,
    ),
});

export type Event = InferSelectModel<typeof events>;

export default events;
