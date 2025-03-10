import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { boolean, integer, pgEnum, pgTable } from "drizzle-orm/pg-core";
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from "drizzle-zod";

import users from "./users";

export const startDayOfWeekEnum = pgEnum("start_day_of_week", [
    "Monday",
    "Sunday",
]);

export const dateFormatEnum = pgEnum("date_format", [
    "MM/DD/YYYY",
    "DD/MM/YYYY",
    "YYYY/MM/DD",
]);

export const userSettings = pgTable("user_settings", {
    userId: integer("user_id")
        .references(() => users.id, { onDelete: "cascade" })
        .primaryKey()
        .notNull(),
    startDayOfWeek: startDayOfWeekEnum("start_day_of_week").notNull(),
    dateFormat: dateFormatEnum("date_format").notNull(),
    enableEmailNotifications: boolean("enable_email_notifications")
        .notNull()
        .default(false),
    enableDesktopNotifications: boolean("enable_desktop_notifications")
        .notNull()
        .default(false),
});

export type DbUserSettings = InferSelectModel<typeof userSettings>;
export type DbUserSettingsInsert = InferInsertModel<typeof userSettings>;

export const userSettingsSelectSchema = createSelectSchema(userSettings);
export const userSettingsInsertSchema = createInsertSchema(userSettings);
export const userSettingsUpdateSchema = createUpdateSchema(userSettings);

export default userSettings;
