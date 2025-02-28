import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { pgTable, integer, primaryKey } from "drizzle-orm/pg-core";
import tags from "./tags";
import events from "./events";
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from "drizzle-zod";

export const eventTags = pgTable(
    "event_tags",
    {
        eventId: integer("event_id")
            .notNull()
            .references(() => events.id),
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

export default eventTags;
