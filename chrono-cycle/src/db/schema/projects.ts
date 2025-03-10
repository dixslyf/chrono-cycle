import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
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
import projectTemplates from "./projectTemplates";

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
    (t) => [unique("projects_unique_user_id_name").on(t.userId, t.name)],
);

export type DbProject = InferSelectModel<typeof projects>;
export type DbProjectInsert = InferInsertModel<typeof projects>;

export type DbExpandedProject = {
    events: DbExpandedEvent[];
} & DbProject;

export type DbExpandedProjectInsert = {
    events: DbExpandedEventInsert[];
} & DbProjectInsert;

export const projectSelectSchema = createSelectSchema(projects);
export const projectInsertSchema = createInsertSchema(projects);
export const projectUpdateSchema = createUpdateSchema(projects);

export default projects;
