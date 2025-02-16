import { InferSelectModel } from "drizzle-orm";
import { pgTable, integer, primaryKey } from "drizzle-orm/pg-core";
import reminderTemplates from "./reminderTemplates";
import notificationMethods from "./notificationMethods";

export const reminderTemplateNotificationMethods = pgTable(
    "reminder_template_notification_methods",
    {
        reminderTemplateId: integer("reminder_template_id").references(
            () => reminderTemplates.id,
        ),
        notificationMethodId: integer("notification_method_id").references(
            () => notificationMethods.id,
        ),
    },
    (t) => [
        primaryKey({ columns: [t.reminderTemplateId, t.notificationMethodId] }),
    ],
);

export type ReminderTemplateNotificationMethod = InferSelectModel<
    typeof reminderTemplateNotificationMethods
>;

export default reminderTemplateNotificationMethods;
