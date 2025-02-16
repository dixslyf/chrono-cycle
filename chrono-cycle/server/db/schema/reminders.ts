import { InferSelectModel } from "drizzle-orm";
import { pgTable, serial, integer, time } from "drizzle-orm/pg-core";
import events from "./events";
import reminderTemplates from "./reminderTemplates";

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

export type Reminder = InferSelectModel<typeof reminders>;

export default reminders;
