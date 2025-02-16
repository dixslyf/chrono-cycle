import { InferSelectModel } from "drizzle-orm";
import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const notificationMethods = pgTable("notification_methods", {
    id: serial("id").primaryKey().unique(),
    name: text("name").notNull(),
});

export type NotificationMethod = InferSelectModel<typeof notificationMethods>;

export default notificationMethods;
