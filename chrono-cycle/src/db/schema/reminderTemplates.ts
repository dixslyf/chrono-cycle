import { InferSelectModel, sql } from "drizzle-orm";
import {
    boolean,
    check,
    integer,
    pgTable,
    serial,
    time,
} from "drizzle-orm/pg-core";
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

import { eventTemplates } from "./eventTemplates";

export const reminderTemplates = pgTable(
    "reminder_templates",
    {
        id: serial("id").primaryKey().unique(),
        eventTemplateId: integer("event_template_id")
            .notNull()
            .references(() => eventTemplates.id, { onDelete: "cascade" }),
        daysBeforeEvent: integer("days_before_event").notNull(),
        time: time("time", { withTimezone: true }).notNull(),
        emailNotifications: boolean("email_notifications")
            .default(true)
            .notNull(),
        desktopNotifications: boolean("desktop_notifications")
            .default(true)
            .notNull(),
    },
    (t) => [
        check(
            "reminders_days_before_event_check",
            sql`${t.daysBeforeEvent} >= 0`,
        ),
    ],
);

export type DbReminderTemplate = InferSelectModel<typeof reminderTemplates>;
export type DbReminderTemplateInsert = z.input<
    typeof reminderTemplateInsertSchema
>;
export type DbReminderTemplateUpdate = z.input<
    typeof reminderTemplateUpdateSchema
>;

export const reminderTemplateSelectSchema =
    createSelectSchema(reminderTemplates);

export const reminderTemplateInsertSchema = createInsertSchema(
    reminderTemplates,
    {
        daysBeforeEvent: (schema) => schema.min(0),
    },
);

export const reminderTemplateUpdateSchema = createUpdateSchema(
    reminderTemplates,
)
    .omit({ eventTemplateId: true })
    .required({ id: true });
