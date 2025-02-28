import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { pgTable, integer, primaryKey } from "drizzle-orm/pg-core";
import tags from "./tags";
import eventTemplates from "./eventTemplates";
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from "drizzle-zod";

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

export type DbEventTemplateTag = InferSelectModel<typeof eventTemplateTags>;
export type DbEventTemplateTagInsert = InferInsertModel<
    typeof eventTemplateTags
>;

export const eventTemplateTagSelectSchema =
    createSelectSchema(eventTemplateTags);
export const eventTemplateTagInsertSchema =
    createInsertSchema(eventTemplateTags);
export const eventTemplateTagUpdateSchema =
    createUpdateSchema(eventTemplateTags);

export default eventTemplateTags;
