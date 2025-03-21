import { InferInsertModel, InferSelectModel, sql } from "drizzle-orm";
import {
    check,
    date,
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

import { DbExpandedEvent, DbExpandedEventInsert } from "./events";
import { projectTemplates } from "./projectTemplates";

export const projects = pgTable(
    "projects",
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
        startsAt: date("starts_at", {
            mode: "date",
        }).notNull(),
        projectTemplateId: integer("project_template_id").references(
            () => projectTemplates.id,
            { onDelete: "set null" },
        ),
    },
    (t) => [
        unique("projects_unique_user_id_name").on(t.userId, t.name),
        check("projects_nonempty_name", sql`TRIM(${t.name}) <> ''`),
        check(
            "projects_nonempty_description",
            sql`TRIM(${t.description}) <> ''`,
        ),
    ],
);

export type DbProject = InferSelectModel<typeof projects>;
export type DbProjectInsert = InferInsertModel<typeof projects>;
export type DbProjectUpdate = Pick<DbProject, "id"> &
    Partial<
        Omit<
            DbProjectInsert,
            "id" | "createdAt" | "updatedAt" | "projectTemplateId" | "userId"
        >
    >;

export type DbExpandedProject = {
    events: DbExpandedEvent[];
} & DbProject;

export type DbExpandedProjectInsert = {
    events: Omit<DbExpandedEventInsert[], "projectId">;
} & DbProjectInsert;

export const projectSelectSchema = createSelectSchema(projects);
export const projectInsertSchema = createInsertSchema(projects, {
    name: (schema) => schema.nonempty(),
    description: (schema) => schema.nonempty(),
});
export const projectUpdateSchema = createUpdateSchema(projects, {
    name: (schema) => schema.nonempty(),
    description: (schema) => schema.nonempty(),
});
