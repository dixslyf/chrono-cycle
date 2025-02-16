import { InferSelectModel } from "drizzle-orm";
import { pgTable, integer, primaryKey } from "drizzle-orm/pg-core";
import reminders from "./reminders";
import notificationMethods from "./notificationMethods";

export const reminderNotificationMethods = pgTable(
    "reminder_notification_methods",
    {
        reminderId: integer("reminder__id").references(() => reminders.id),
        notificationMethodId: integer("notification_method_id").references(
            () => notificationMethods.id,
        ),
    },
    (t) => [primaryKey({ columns: [t.reminderId, t.notificationMethodId] })],
);

export type ReminderNotificationMethod = InferSelectModel<
    typeof reminderNotificationMethods
>;

export default reminderNotificationMethods;
