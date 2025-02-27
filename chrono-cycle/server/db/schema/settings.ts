import { InferSelectModel } from "drizzle-orm";
import { pgTable, varchar, integer } from "drizzle-orm/pg-core";
import users from "./users";
import notificationMethods from "./notificationMethods"; 

export const settings = pgTable("settings", {
    userId: integer("user_id")
        .references(() => users.id)
        .primaryKey() 
        .notNull(),
    startDayOfWeek: varchar("start_day_of_week", { length: 10 }).notNull(),
    dateFormat: varchar("date_format", { length: 10 }).notNull(),
    notificationMethodId: integer("notification_method_id")
        .references(() => notificationMethods.id)
        .notNull(),
});

export type Setting = InferSelectModel<typeof settings>;

export default settings;
