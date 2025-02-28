import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
    pgTable,
    serial,
    timestamp,
    integer,
    text,
    unique,
} from "drizzle-orm/pg-core";
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from "drizzle-zod";

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
        updatedAt: timestamp("updated_at", {
            withTimezone: true,
            mode: "date",
        })
            .notNull()
            .defaultNow(),
    },
    (t) => [
        unique("project_templates_unique_user_id_name").on(t.userId, t.name),
    ],
);

export type ProjectTemplate = InferSelectModel<typeof projectTemplates>;
export type ProjectTemplateInsert = InferInsertModel<typeof projectTemplates>;

export const projectTemplateSelectSchema = createSelectSchema(projectTemplates);
export const projectTemplateInsertSchema = createInsertSchema(projectTemplates);
export const projectTemplateUpdateSchema = createUpdateSchema(projectTemplates);

export default projectTemplates;
