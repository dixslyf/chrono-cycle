import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { pgTable, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from "drizzle-zod";

import { DbUserSettings, DbUserSettingsInsert } from "./userSettings";

export const users = pgTable("users", {
    id: serial("id").primaryKey().unique(),
    username: varchar("username", { length: 255 }).notNull().unique(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    hashedPassword: varchar("hashed_password", { length: 128 }).notNull(),
    createdAt: timestamp("created_at", {
        withTimezone: true,
        mode: "date",
    })
        .notNull()
        .defaultNow(),
});

export type DbUser = InferSelectModel<typeof users>;
export type DbUserInsert = InferInsertModel<typeof users>;

export type DbExpandedUser = DbUser & { settings: DbUserSettings };
export type DbExpandedUserInsert = DbUserInsert & {
    settings?: Omit<DbUserSettingsInsert, "userId"> | undefined;
};

export const userSelectSchema = createSelectSchema(users);
export const userInsertSchema = createInsertSchema(users);
export const userUpdateSchema = createUpdateSchema(users);

export default users;
