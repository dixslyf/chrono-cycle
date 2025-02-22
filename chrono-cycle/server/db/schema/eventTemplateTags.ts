import { InferSelectModel } from "drizzle-orm";
import { pgTable, integer, primaryKey } from "drizzle-orm/pg-core";
import tags from "./tags";
import eventTemplates from "./eventTemplates";

export const eventTemplateTags = pgTable(
    "event_template_tags",
    {
        eventTemplateId: integer("event_template_id")
            .notNull()
            .references(() => eventTemplates.id),
        tagId: integer("tag_id")
            .notNull()
            .references(() => tags.id),
    },
    (t) => [primaryKey({ columns: [t.eventTemplateId, t.tagId] })],
);

export type EventTemplateTag = InferSelectModel<typeof eventTemplateTags>;

export default eventTemplateTags;
