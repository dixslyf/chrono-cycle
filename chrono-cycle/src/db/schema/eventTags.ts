import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { integer, pgTable, primaryKey } from "drizzle-orm/pg-core";
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from "drizzle-zod";

import { events } from "./events";
import { tags } from "./tags";

export const eventTags = pgTable(
    "event_tags",
    {
        eventId: integer("event_id")
            .notNull()
            .references(() => events.id, { onDelete: "cascade" }),
        tagId: integer("tag_id")
            .notNull()
            .references(() => tags.id),
    },
    (t) => [primaryKey({ columns: [t.eventId, t.tagId] })],
);

export type DbEventTag = InferSelectModel<typeof eventTags>;
export type DbEventTagInsert = InferInsertModel<typeof eventTags>;

export const eventTagSelectSchema = createSelectSchema(eventTags);
export const eventTagInsertSchema = createInsertSchema(eventTags);
export const eventTagUpdateSchema = createUpdateSchema(eventTags);
