import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { pgTable, serial, integer, time } from "drizzle-orm/pg-core";
import events from "./events";
import reminderTemplates from "./reminderTemplates";
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from "drizzle-zod";

export const reminders = pgTable("reminders", {
    id: serial("id").primaryKey().unique(),
    eventId: integer("event_id")
        .notNull()
        .references(() => events.id),
    daysBeforeEvent: integer("days_before_event").notNull(),
    time: time("time").notNull(),
    reminderTemplateId: integer("reminder_template_id").references(
        () => reminderTemplates.id,
    ),
});

export type DbReminder = InferSelectModel<typeof reminders>;
export type DbReminderInsert = InferInsertModel<typeof reminders>;

export const reminderSelectSchema = createSelectSchema(reminders);
export const reminderInsertSchema = createInsertSchema(reminders);
export const reminderUpdateSchema = createUpdateSchema(reminders);

export default reminders;
