import { InferSelectModel } from "drizzle-orm";
import {
    pgTable,
    serial,
    timestamp,
    integer,
    text,
    unique,
} from "drizzle-orm/pg-core";

export const projectTemplates = pgTable(
    "project_templates",
    {
        id: serial("id").primaryKey().unique(),
        userId: integer("user_id").notNull(),
        name: text("name").notNull().unique(),
        description: text("description").notNull(),
        createdAt: timestamp("created_at", {
            withTimezone: true,
            mode: "date",
        })
            .notNull()
            .defaultNow(),
        updatedAt: timestamp("created_at", {
            withTimezone: true,
            mode: "date",
        })
            .notNull()
            .defaultNow(),
    },
    (t) => [unique("unique_user_id_name").on(t.userId, t.name)],
);

export type ProjectTemplate = InferSelectModel<typeof projectTemplates>;

export default projectTemplates;
