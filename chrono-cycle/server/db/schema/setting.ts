import { InferSelectModel } from "drizzle-orm";
import { pgTable, serial, varchar, boolean, integer } from "drizzle-orm/pg-core";
import users from "./users"; 

export const settings = pgTable("settings", {
    id: serial("id").primaryKey().unique(), 
    userId: integer("user_id") 
        .references(() => users.id)
        .notNull(),
    startDayOfWeek: varchar("start_day_of_week", { length: 10 }) 
        .notNull(),
    dataFormat: varchar("data_format", { length: 10 }) 
        .notNull(),
    emailNotification: boolean("email_notification") 
        .notNull(),
    desktopNotification: boolean("desktop_notification") 
        .notNull(),
});

export type Setting = InferSelectModel<typeof settings>;

export default settings;
