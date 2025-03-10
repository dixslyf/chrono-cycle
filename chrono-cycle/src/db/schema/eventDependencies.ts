import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { integer, pgTable, primaryKey } from "drizzle-orm/pg-core";
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from "drizzle-zod";

import dependencyTypeEnum from "./dependencyType";
import events from "./events";

export const eventDependencies = pgTable(
    "event_dependencies",
    {
        parentId: integer("parent_id")
            .notNull()
            .references(() => events.id, { onDelete: "cascade" }),
        childId: integer("child_id")
            .notNull()
            .references(() => events.id, { onDelete: "cascade" }),
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
