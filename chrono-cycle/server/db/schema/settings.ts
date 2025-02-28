import { InferSelectModel } from "drizzle-orm";
import { pgTable, varchar, integer, boolean } from "drizzle-orm/pg-core";
import users from "./users";

export const settings = pgTable("settings", {
    userId: integer("user_id")
        .references(() => users.id)
        .primaryKey() 
        .notNull(),
    startDayOfWeek: varchar("start_day_of_week", { length: 10 }).notNull(),
    dateFormat: varchar("date_format", { length: 10 }).notNull(),
    emailNotification: boolean("email_notification")
        .notNull() 
        .default(false), 
    desktopNotification: boolean("desktop_notification")
        .notNull() 
        .default(false), 
});

export type Setting = InferSelectModel<typeof settings>;

export default settings;
