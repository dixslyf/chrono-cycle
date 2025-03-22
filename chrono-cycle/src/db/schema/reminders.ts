import { InferSelectModel } from "drizzle-orm";
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
import { z } from "zod";

import { events } from "./events";
import { reminderTemplates } from "./reminderTemplates";

export const reminders = pgTable("reminders", {
    id: serial("id").primaryKey().unique(),
    eventId: integer("event_id")
        .notNull()
        .references(() => events.id, { onDelete: "cascade" }),
    triggerTime: timestamp("trigger_time", { withTimezone: true }).notNull(),
    emailNotifications: boolean("email_notifications").default(true).notNull(),
    desktopNotifications: boolean("desktop_notifications")
        .default(true)
        .notNull(),
    reminderTemplateId: integer("reminder_template_id").references(
        () => reminderTemplates.id,
        { onDelete: "set null" },
    ),
    triggerRunId: text("trigger_run_id"),
});

export type DbReminder = InferSelectModel<typeof reminders>;
export type DbReminderInsert = z.input<typeof reminderInsertSchema>;
export type DbReminderUpdate = z.input<typeof reminderUpdateSchema>;

export const reminderSelectSchema = createSelectSchema(reminders);
export const reminderInsertSchema = createInsertSchema(reminders);
export const reminderUpdateSchema = createUpdateSchema(reminders)
    .omit({ eventId: true, reminderTemplateId: true })
    .required({
        id: true,
    });
