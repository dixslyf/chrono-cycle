import { InferSelectModel } from "drizzle-orm";
import { boolean, integer, pgEnum, pgTable } from "drizzle-orm/pg-core";
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

import { users } from "./users";

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
    startDayOfWeek: startDayOfWeekEnum("start_day_of_week")
        .notNull()
        .default("Monday"),
    dateFormat: dateFormatEnum("date_format").notNull().default("DD/MM/YYYY"),
    enableEmailNotifications: boolean("enable_email_notifications")
        .notNull()
        .default(false),
    enableDesktopNotifications: boolean("enable_desktop_notifications")
        .notNull()
        .default(false),
});

export type DbUserSettings = InferSelectModel<typeof userSettings>;
export type DbUserSettingsInsert = z.input<typeof userSettingsInsertSchema>;
export type DbUserSettingsUpdate = z.input<typeof userSettingsUpdateSchema>;

export const userSettingsSelectSchema = createSelectSchema(userSettings);
export const userSettingsInsertSchema = createInsertSchema(userSettings);
export const userSettingsUpdateSchema = createUpdateSchema(
    userSettings,
).required({ userId: true });
