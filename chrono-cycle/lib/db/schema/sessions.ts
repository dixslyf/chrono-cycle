import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import users from "./users";
import { InferSelectModel } from "drizzle-orm";

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

export default sessions;
