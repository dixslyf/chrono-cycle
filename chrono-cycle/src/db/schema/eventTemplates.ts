import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
    boolean,
    integer,
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

import eventTypeEnum from "./eventType";
import projectTemplates from "./projectTemplates";
import {
    DbReminderTemplate,
    DbReminderTemplateInsert,
} from "./reminderTemplates";
import { DbTag, DbTagInsert } from "./tags";

export const eventTemplates = pgTable("event_templates", {
    id: serial("id").primaryKey().unique(),
    name: text("name").notNull(),
    offsetDays: integer("offset_days").notNull(),
    duration: integer("duration").notNull(),
    note: text("note").notNull().default(""),
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
        .references(() => projectTemplates.id, { onDelete: "cascade" }),
});

export type DbEventTemplate = InferSelectModel<typeof eventTemplates>;
export type DbEventTemplateInsert = InferInsertModel<typeof eventTemplates>;

export type DbExpandedEventTemplate = {
    reminders: DbReminderTemplate[];
    tags: DbTag[];
} & DbEventTemplate;

export type DbExpandedEventTemplateInsert = {
    reminders: DbReminderTemplateInsert[];
    tags: DbTagInsert[];
} & DbEventTemplate;

export const eventTemplateSelectSchema = createSelectSchema(eventTemplates);
export const eventTemplateInsertSchema = createInsertSchema(eventTemplates);
export const eventTemplateUpdateSchema = createUpdateSchema(eventTemplates);

export default eventTemplates;
