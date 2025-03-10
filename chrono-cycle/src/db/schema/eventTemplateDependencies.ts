import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { integer, pgTable, primaryKey } from "drizzle-orm/pg-core";
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from "drizzle-zod";

import dependencyTypeEnum from "./dependencyType";
import eventTemplates from "./eventTemplates";

export const eventTemplateDependencies = pgTable(
    "event_template_dependencies",
    {
        parentId: integer("parent_id")
            .notNull()
            .references(() => eventTemplates.id, { onDelete: "cascade" }),
        childId: integer("child_id")
            .notNull()
            .references(() => eventTemplates.id, { onDelete: "cascade" }),
        dependencyType: dependencyTypeEnum("dependency_type").notNull(),
        lagDays: integer("lag_days").notNull(),
    },
    (t) => [primaryKey({ columns: [t.parentId, t.childId] })],
);

export type DbEventTemplateDependency = InferSelectModel<
    typeof eventTemplateDependencies
>;
export type DbEventTemplateDependencyInsert = InferInsertModel<
    typeof eventTemplateDependencies
>;

export const eventTemplateDependencySelectSchema = createSelectSchema(
    eventTemplateDependencies,
);
export const eventTemplateDependencyInsertSchema = createInsertSchema(
    eventTemplateDependencies,
);
export const eventTemplateDependencyUpdateSchema = createUpdateSchema(
    eventTemplateDependencies,
);

export default eventTemplateDependencies;
