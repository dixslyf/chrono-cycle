import { InferSelectModel } from "drizzle-orm";
import { integer, pgTable, primaryKey } from "drizzle-orm/pg-core";
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

import { eventTemplates } from "./eventTemplates";
import { tags } from "./tags";

export const eventTemplateTags = pgTable(
    "event_template_tags",
    {
        eventTemplateId: integer("event_template_id")
            .notNull()
            .references(() => eventTemplates.id, { onDelete: "cascade" }),
        tagId: integer("tag_id")
            .notNull()
            .references(() => tags.id),
    },
    (t) => [primaryKey({ columns: [t.eventTemplateId, t.tagId] })],
);

export type DbEventTemplateTag = InferSelectModel<typeof eventTemplateTags>;
export type DbEventTemplateTagInsert = z.input<
    typeof eventTemplateTagInsertSchema
>;
export type DbEventTemplateTagUpdate = z.input<
    typeof eventTemplateTagUpdateSchema
>;

export const eventTemplateTagSelectSchema =
    createSelectSchema(eventTemplateTags);
export const eventTemplateTagInsertSchema =
    createInsertSchema(eventTemplateTags);
export const eventTemplateTagUpdateSchema =
    createUpdateSchema(eventTemplateTags);
