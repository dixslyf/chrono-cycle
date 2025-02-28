import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { pgTable, integer, primaryKey } from "drizzle-orm/pg-core";
import events from "./events";
import dependencyTypeEnum from "./dependencyType";
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from "drizzle-zod";

export const eventDependencies = pgTable(
    "event_dependencies",
    {
        parentId: integer("parent_id")
            .notNull()
            .references(() => events.id),
        childId: integer("child_id")
            .notNull()
            .references(() => events.id),
        dependencyType: dependencyTypeEnum("dependency_type").notNull(),
        lagDays: integer("lag_days").notNull(),
    },
    (t) => [primaryKey({ columns: [t.parentId, t.childId] })],
);

export type DbEventDependency = InferSelectModel<typeof eventDependencies>;
export type DbEventDependencyInsert = InferInsertModel<
    typeof eventDependencies
>;

export const eventDependencySelectSchema =
    createSelectSchema(eventDependencies);
export const eventDependencyInsertSchema =
    createInsertSchema(eventDependencies);
export const eventDependencyUpdateSchema =
    createUpdateSchema(eventDependencies);

export default eventDependencies;
