import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { pgTable, integer, primaryKey } from "drizzle-orm/pg-core";
import reminderTemplates from "./reminderTemplates";
import notificationMethods from "./notificationMethods";
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from "drizzle-zod";

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
export type ReminderTemplateNotificationMethodInsert = InferInsertModel<
    typeof reminderTemplateNotificationMethods
>;

export const reminderTemplateNotificationMethodsSelectSchema =
    createSelectSchema(reminderTemplateNotificationMethods);
export const reminderTemplateNotificationMethodsInsertSchema =
    createInsertSchema(reminderTemplateNotificationMethods);
export const reminderTemplateNotificationMethodsUpdateSchema =
    createUpdateSchema(reminderTemplateNotificationMethods);

export default reminderTemplateNotificationMethods;
