import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { pgTable, serial, text } from "drizzle-orm/pg-core";
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from "drizzle-zod";

export const notificationMethods = pgTable("notification_methods", {
    id: serial("id").primaryKey().unique(),
    name: text("name").notNull(),
});

export type NotificationMethod = InferSelectModel<typeof notificationMethods>;
export type NotificationMethodInsert = InferInsertModel<
    typeof notificationMethods
>;

export const notificationMethodSelectSchema =
    createSelectSchema(notificationMethods);
export const notificationMethodInsertSchema =
    createInsertSchema(notificationMethods);
export const notificationMethodUpdateSchema =
    createUpdateSchema(notificationMethods);

export default notificationMethods;
