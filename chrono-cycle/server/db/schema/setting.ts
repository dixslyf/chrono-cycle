import { InferSelectModel } from "drizzle-orm";
import { pgTable, serial, varchar, boolean, integer } from "drizzle-orm/pg-core";
import users from "./users";
import notificationMethods from "./notificationMethods"; 

export const settings = pgTable("settings", {
    id: serial("id").primaryKey().unique(), 
    userId: integer("user_id") 
        .references(() => users.id)
        .notNull(),
    startDayOfWeek: varchar("start_day_of_week", { length: 10 }) 
        .notNull(),
    dataFormat: varchar("data_format", { length: 10 }) 
        .notNull(),
    notificationMethodId: integer("notification_method_id").references(
        () => notificationMethods.id,
    ),
});

export type Setting = InferSelectModel<typeof settings>;

export default settings;
