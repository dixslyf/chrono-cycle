import { InferSelectModel } from "drizzle-orm";
import { pgTable, integer, primaryKey } from "drizzle-orm/pg-core";
import eventTemplates from "./eventTemplates";
import dependencyTypeEnum from "./dependencyType";

export const eventTemplateDependencies = pgTable(
    "event_template_dependencies",
    {
        parentId: integer("parent_id").references(() => eventTemplates.id),
        childId: integer("parent_id").references(() => eventTemplates.id),
        dependencyType: dependencyTypeEnum("dependency_type").notNull(),
        lagDays: integer("lag_days").notNull(),
    },
    (t) => [primaryKey({ columns: [t.parentId, t.childId] })],
);

export type EventTemplateDependency = InferSelectModel<
    typeof eventTemplateDependencies
>;

export default eventTemplateDependencies;
