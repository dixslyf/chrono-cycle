import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
    createSelectSchema,
    createUpdateSchema,
    createInsertSchema,
} from "drizzle-zod";
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
    note: text("note").notNull(),
    eventType: eventTypeEnum("event_type").notNull(),
    autoReschedule: boolean("auto_reschedule").notNull(),
    updatedAt: timestamp("created_at", {
        withTimezone: true,
        mode: "date",
    })
        .notNull()
        .defaultNow(),
    projectTemplateId: integer("project_template_id")
        .notNull()
        .references(() => projectTemplates.id),
});

export type DbEventTemplate = InferSelectModel<typeof eventTemplates>;
export type DbEventTemplateInsert = InferInsertModel<typeof eventTemplates>;

export const eventTemplateSelectSchema = createSelectSchema(eventTemplates);
export const eventTemplateInsertSchema = createInsertSchema(eventTemplates);
export const eventTemplateUpdateSchema = createUpdateSchema(eventTemplates);

export default eventTemplates;
