import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import users from "./users";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from "drizzle-zod";

export const sessions = pgTable("sessions", {
    id: text("id").primaryKey(),
    userId: integer("user_id")
        .notNull()
        .references(() => users.id),
    expiresAt: timestamp("expires_at", {
        withTimezone: true,
        mode: "date",
    }).notNull(),
});

export type Session = InferSelectModel<typeof sessions>;
export type SessionInsert = InferInsertModel<typeof sessions>;

export const sessionSelectSchema = createSelectSchema(sessions);
export const sessionInsertSchema = createInsertSchema(sessions);
export const sessionUpdateSchema = createUpdateSchema(sessions);

export default sessions;
