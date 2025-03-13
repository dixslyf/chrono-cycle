import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { boolean, integer, pgTable, serial, time } from "drizzle-orm/pg-core";
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from "drizzle-zod";

import { events } from "./events";
import { reminderTemplates } from "./reminderTemplates";

export const reminders = pgTable("reminders", {
    id: serial("id").primaryKey().unique(),
    eventId: integer("event_id")
        .notNull()
        .references(() => events.id, { onDelete: "cascade" }),
    daysBeforeEvent: integer("days_before_event").notNull(),
    time: time("time", { withTimezone: true }).notNull(),
    emailNotifications: boolean("email_notifications").default(true).notNull(),
    desktopNotifications: boolean("desktop_notifications")
        .default(true)
        .notNull(),
    reminderTemplateId: integer("reminder_template_id").references(
        () => reminderTemplates.id,
        { onDelete: "set null" },
    ),
});

export type DbReminder = InferSelectModel<typeof reminders>;
export type DbReminderInsert = InferInsertModel<typeof reminders>;

export const reminderSelectSchema = createSelectSchema(reminders);
export const reminderInsertSchema = createInsertSchema(reminders);
export const reminderUpdateSchema = createUpdateSchema(reminders);
