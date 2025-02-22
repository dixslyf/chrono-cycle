import { InferSelectModel } from "drizzle-orm";
import { pgTable, integer, primaryKey } from "drizzle-orm/pg-core";
import tags from "./tags";
import events from "./events";

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

export type EventTag = InferSelectModel<typeof eventTags>;

export default eventTags;
