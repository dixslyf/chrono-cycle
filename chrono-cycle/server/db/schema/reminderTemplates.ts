import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { pgTable, serial, integer, time } from "drizzle-orm/pg-core";
import eventTemplates from "./eventTemplates";
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from "drizzle-zod";

export const reminderTemplates = pgTable("reminder_templates", {
    id: serial("id").primaryKey().unique(),
    eventTemplateId: integer("event_template_id")
        .notNull()
        .references(() => eventTemplates.id),
    daysBeforeEvent: integer("days_before_event").notNull(),
    time: time("time").notNull(),
});

export type ReminderTemplate = InferSelectModel<typeof reminderTemplates>;
export type ReminderTemplateInsert = InferInsertModel<typeof reminderTemplates>;

export const reminderTemplateSelectSchema =
    createSelectSchema(reminderTemplates);
export const reminderTemplateInsertSchema =
    createInsertSchema(reminderTemplates);
export const reminderTemplateUpdateSchema =
    createUpdateSchema(reminderTemplates);

export default reminderTemplates;
