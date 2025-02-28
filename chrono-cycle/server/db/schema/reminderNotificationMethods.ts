import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { pgTable, integer, primaryKey } from "drizzle-orm/pg-core";
import reminders from "./reminders";
import notificationMethods from "./notificationMethods";
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from "drizzle-zod";

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

export type DbReminderNotificationMethod = InferSelectModel<
    typeof reminderNotificationMethods
>;
export type DbReminderNotificationMethodInsert = InferInsertModel<
    typeof reminderNotificationMethods
>;

export const reminderNotificationMethodsSelectSchema = createSelectSchema(
    reminderNotificationMethods,
);
export const reminderNotificationMethodsInsertSchema = createInsertSchema(
    reminderNotificationMethods,
);
export const reminderNotificationMethodsUpdateSchema = createUpdateSchema(
    reminderNotificationMethods,
);

export default reminderNotificationMethods;
