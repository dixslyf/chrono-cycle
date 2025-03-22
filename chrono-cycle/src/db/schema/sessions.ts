import { InferSelectModel } from "drizzle-orm";
import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

import { users } from "./users";

export const sessions = pgTable("sessions", {
    id: text("id").primaryKey(),
    userId: integer("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", {
        withTimezone: true,
        mode: "date",
    }).notNull(),
});

export type DbSession = InferSelectModel<typeof sessions>;
export type DbSessionInsert = z.input<typeof sessionInsertSchema>;
export type DbSessionUpdate = z.input<typeof sessionUpdateSchema>;

export const sessionSelectSchema = createSelectSchema(sessions);
export const sessionInsertSchema = createInsertSchema(sessions);
export const sessionUpdateSchema = createUpdateSchema(sessions).required({
    id: true,
});
