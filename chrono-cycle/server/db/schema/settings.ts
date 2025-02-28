import { InferSelectModel } from "drizzle-orm";
import { pgEnum, pgTable, integer, boolean } from "drizzle-orm/pg-core";
import users from "./users";

// Define the enum for startDayOfWeek
export const startDayOfWeekEnum = pgEnum("start_day_of_week", [
    "Monday",
    "Sunday",
]);

// Define the enum for dateFormat
export const dateFormatEnum = pgEnum("date_format", [
    "MM/DD/YYYY",
    "DD/MM/YYYY",
    "YYYY/MM/DD",
]);

export const settings = pgTable("settings", {
    userId: integer("user_id")
        .references(() => users.id)
        .primaryKey()
        .notNull(),

    startDayOfWeek: startDayOfWeekEnum("start_day_of_week").notNull(),

    dateFormat: dateFormatEnum("date_format").notNull(),

    emailNotification: boolean("email_notification")
        .notNull()
        .default(false),

    desktopNotification: boolean("desktop_notification")
        .notNull()
        .default(false),
});

export type Setting = InferSelectModel<typeof settings>;

export default settings;
