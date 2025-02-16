import { InferSelectModel } from "drizzle-orm";
import {
    pgTable,
    serial,
    timestamp,
    integer,
    text,
    boolean,
} from "drizzle-orm/pg-core";
import projectTemplates from "./projectTemplates";
import eventTypeEnum from "./eventType";

export const eventTemplates = pgTable("event_templates", {
    id: serial("id").primaryKey().unique(),
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
    projectTemplateId: integer("project_template_id").references(
        () => projectTemplates.id,
    ),
});

export type EventTemplate = InferSelectModel<typeof eventTemplates>;

export default eventTemplates;
