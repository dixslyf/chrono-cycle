import { InferSelectModel } from "drizzle-orm";
import { pgTable, integer, primaryKey } from "drizzle-orm/pg-core";
import events from "./events";
import dependencyTypeEnum from "./dependencyType";

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

export type EventDependency = InferSelectModel<typeof eventDependencies>;

export default eventDependencies;
