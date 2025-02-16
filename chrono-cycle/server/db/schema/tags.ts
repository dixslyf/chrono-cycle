import { InferSelectModel } from "drizzle-orm";
import { pgTable, serial, text } from "drizzle-orm/pg-core";

export const tags = pgTable("tags", {
    id: serial("id").primaryKey().unique(),
    name: text("name").notNull(),
});

export type Tag = InferSelectModel<typeof tags>;

export default tags;
