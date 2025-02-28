import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { pgTable, serial, text } from "drizzle-orm/pg-core";
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from "drizzle-zod";

export const tags = pgTable("tags", {
    id: serial("id").primaryKey().unique(),
    name: text("name").notNull(),
});

export type DbTag = InferSelectModel<typeof tags>;
export type DbTagInsert = InferInsertModel<typeof tags>;

export const tagSelectSchema = createSelectSchema(tags);
export const tagInsertSchema = createInsertSchema(tags);
export const tagUpdateSchema = createUpdateSchema(tags);

export default tags;
