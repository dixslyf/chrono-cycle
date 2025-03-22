import { InferSelectModel, sql } from "drizzle-orm";
import {
    check,
    integer,
    pgTable,
    serial,
    text,
    unique,
} from "drizzle-orm/pg-core";
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

import { users } from "./users";

export const tags = pgTable(
    "tags",
    {
        id: serial("id").primaryKey().unique(),
        userId: integer("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        name: text("name").notNull(),
    },
    (t) => [
        unique("tags_unique_user_id_name").on(t.userId, t.name),
        check("tags_nonempty_name", sql`TRIM(${t.name}) <> ''`),
    ],
);

export type DbTag = InferSelectModel<typeof tags>;
export type DbTagInsert = z.input<typeof tagInsertSchema>;
export type DbTagUpdate = z.input<typeof tagUpdateSchema>;

export const tagSelectSchema = createSelectSchema(tags);

export const tagInsertSchema = createInsertSchema(tags, {
    name: (schema) => schema.nonempty(),
});

export const tagUpdateSchema = createUpdateSchema(tags, {
    name: (schema) => schema.nonempty(),
}).required({
    id: true,
});
