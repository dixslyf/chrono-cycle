import { InferInsertModel, InferSelectModel, sql } from "drizzle-orm";
import {
    check,
    integer,
    pgTable,
    serial,
    text,
    timestamp,
    unique,
} from "drizzle-orm/pg-core";
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from "drizzle-zod";

import {
    DbExpandedEventTemplate,
    DbExpandedEventTemplateInsert,
} from "./eventTemplates";
import { users } from "./users";

export const projectTemplates = pgTable(
    "project_templates",
    {
        id: serial("id").primaryKey().unique(),
        userId: integer("user_id")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
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
        check("project_templates_nonempty_name", sql`TRIM(${t.name}) <> ''`),
        check(
            "project_templates_nonempty_description",
            sql`TRIM(${t.description}) <> ''`,
        ),
    ],
);

export type DbProjectTemplate = InferSelectModel<typeof projectTemplates>;
export type DbProjectTemplateInsert = InferInsertModel<typeof projectTemplates>;
export type DbProjectTemplateUpdate = Pick<DbProjectTemplate, "id"> &
    Partial<
        Omit<
            DbProjectTemplateInsert,
            "id" | "createdAt" | "updatedAt" | "userId"
        >
    >;

export type DbExpandedProjectTemplate = {
    events: DbExpandedEventTemplate[];
} & DbProjectTemplate;

export type DbExpandedProjectTemplateInsert = {
    events: DbExpandedEventTemplateInsert[];
} & DbProjectTemplateInsert;

export const projectTemplateSelectSchema = createSelectSchema(projectTemplates);
export const projectTemplateInsertSchema = createInsertSchema(
    projectTemplates,
    {
        name: (schema) => schema.nonempty(),
        description: (schema) => schema.nonempty(),
    },
);
export const projectTemplateUpdateSchema = createUpdateSchema(
    projectTemplates,
    {
        name: (schema) => schema.nonempty(),
        description: (schema) => schema.nonempty(),
    },
).required({
    id: true,
});
