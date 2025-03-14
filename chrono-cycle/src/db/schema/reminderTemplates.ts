import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { boolean, integer, pgTable, serial, time } from "drizzle-orm/pg-core";
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from "drizzle-zod";

import { eventTemplates } from "./eventTemplates";

export const reminderTemplates = pgTable("reminder_templates", {
    id: serial("id").primaryKey().unique(),
    eventTemplateId: integer("event_template_id")
        .notNull()
        .references(() => eventTemplates.id, { onDelete: "cascade" }),
    daysBeforeEvent: integer("days_before_event").notNull(),
    time: time("time", { withTimezone: true }).notNull(),
    emailNotifications: boolean("email_notifications").default(true).notNull(),
    desktopNotifications: boolean("desktop_notifications")
        .default(true)
        .notNull(),
});

export type DbReminderTemplate = InferSelectModel<typeof reminderTemplates>;
export type DbReminderTemplateInsert = InferInsertModel<
    typeof reminderTemplates
>;
export type DbReminderTemplateUpdate = Pick<DbReminderTemplate, "id"> &
    Partial<Omit<DbReminderTemplateInsert, "id" | "eventTemplateId">>;

export const reminderTemplateSelectSchema =
    createSelectSchema(reminderTemplates);
export const reminderTemplateInsertSchema =
    createInsertSchema(reminderTemplates);
export const reminderTemplateUpdateSchema = createUpdateSchema(
    reminderTemplates,
).required({ id: true });
