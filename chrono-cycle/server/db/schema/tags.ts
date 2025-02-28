import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { integer, pgTable, serial, text, unique } from "drizzle-orm/pg-core";
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from "drizzle-zod";
import users from "./users";

export const tags = pgTable(
    "tags",
    {
        id: serial("id").primaryKey().unique(),
        userId: integer("user_id")
            .notNull()
            .references(() => users.id),
        name: text("name").notNull(),
    },
    (t) => [unique("tags_unique_user_id_name").on(t.userId, t.name)],
);

export type DbTag = InferSelectModel<typeof tags>;
export type DbTagInsert = InferInsertModel<typeof tags>;

export const tagSelectSchema = createSelectSchema(tags);
export const tagInsertSchema = createInsertSchema(tags);
export const tagUpdateSchema = createUpdateSchema(tags);

export default tags;
