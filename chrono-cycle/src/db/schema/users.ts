import { InferInsertModel, InferSelectModel, sql } from "drizzle-orm";
import {
    check,
    pgTable,
    serial,
    text,
    timestamp,
    varchar,
} from "drizzle-orm/pg-core";
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

import { DbUserSettings, DbUserSettingsInsert } from "./userSettings";

export const users = pgTable(
    "users",
    {
        id: serial("id").primaryKey().unique(),
        username: varchar("username", { length: 255 }).notNull().unique(),
        email: varchar("email", { length: 255 }).notNull().unique(),
        hashedPassword: text("hashed_password").notNull(),
        createdAt: timestamp("created_at", {
            withTimezone: true,
            mode: "date",
        })
            .notNull()
            .defaultNow(),
    },
    (t) => [
        check("users_nonempty_username", sql`TRIM(${t.username}) <> ''`),
        check("users_min_length_username", sql`LENGTH(${t.username}) >= 3`),
        check("users_no_whitespace_username", sql`${t.username} ~ '^\\S*$'`),
        check("users_nonempty_email", sql`TRIM(${t.email}) <> ''`),
        check(
            "users_nonempty_hashed_password",
            sql`TRIM(${t.hashedPassword}) <> ''`,
        ),
    ],
);

export type DbUser = InferSelectModel<typeof users>;
export type DbUserInsert = InferInsertModel<typeof users>;

export type DbExpandedUser = DbUser & { settings: DbUserSettings };
export type DbExpandedUserInsert = DbUserInsert & {
    settings?: Omit<DbUserSettingsInsert, "userId"> | undefined;
};

function refineUsernameSchema(schema: z.ZodString) {
    return schema
        .nonempty()
        .regex(/^\S+$/, "Username cannot contain spaces")
        .min(3, "Username must be at least 3 characters long")
        .max(255, "Username must not exceed 255 characters");
}

export const userSelectSchema = createSelectSchema(users);
export const userInsertSchema = createInsertSchema(users, {
    username: (schema) => refineUsernameSchema(schema),
    email: (schema) => schema.email().nonempty(),
    hashedPassword: (schema) => schema.nonempty(),
});
export const userUpdateSchema = createUpdateSchema(users, {
    username: (schema) => refineUsernameSchema(schema),
    email: (schema) => schema.email().nonempty(),
    hashedPassword: (schema) => schema.nonempty(),
});
