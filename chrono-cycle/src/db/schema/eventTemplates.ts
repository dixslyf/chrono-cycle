import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
    boolean,
    integer,
    pgTable,
    serial,
    text,
    timestamp,
} from "drizzle-orm/pg-core";
import {
    createInsertSchema,
    createSelectSchema,
    createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

import { eventTypeEnum } from "./eventType";
import { projectTemplates } from "./projectTemplates";
import {
    DbReminderTemplate,
    DbReminderTemplateInsert,
    DbReminderTemplateUpdate,
    reminderTemplateInsertSchema,
    reminderTemplateUpdateSchema,
} from "./reminderTemplates";
import { DbTag, DbTagInsert, tagInsertSchema } from "./tags";

export const eventTemplates = pgTable("event_templates", {
    id: serial("id").primaryKey().unique(),
    name: text("name").notNull(),
    offsetDays: integer("offset_days").notNull(),
    duration: integer("duration").notNull(),
    note: text("note").notNull().default(""),
    eventType: eventTypeEnum("event_type").notNull(),
    autoReschedule: boolean("auto_reschedule").notNull(),
    updatedAt: timestamp("created_at", {
        withTimezone: true,
        mode: "date",
    })
        .notNull()
        .defaultNow(),
    projectTemplateId: integer("project_template_id")
        .notNull()
        .references(() => projectTemplates.id, { onDelete: "cascade" }),
});

export type DbEventTemplate = InferSelectModel<typeof eventTemplates>;
export type DbEventTemplateInsert = InferInsertModel<typeof eventTemplates>;
export type DbEventTemplateUpdate = Pick<DbEventTemplate, "id"> &
    Partial<
        Omit<
            DbEventTemplateInsert,
            "id" | "eventType" | "projectTemplateId" | "updatedAt"
        >
    >;

export type DbExpandedEventTemplate = {
    reminders: DbReminderTemplate[];
    tags: DbTag[];
} & DbEventTemplate;

export type DbExpandedEventTemplateInsert = {
    reminders: Omit<DbReminderTemplateInsert, "eventTemplateId">[];
    tags: DbTagInsert[];
} & DbEventTemplateInsert;

export type DbExpandedEventTemplateUpdate = DbEventTemplateUpdate & {
    remindersDelete: number[];
    remindersUpdate: DbReminderTemplateUpdate[];
    remindersInsert: Omit<DbReminderTemplateInsert, "eventTemplateId">[];
    tags: DbTagInsert[];
};

export const eventTemplateSelectSchema = createSelectSchema(eventTemplates);
export const eventTemplateInsertSchema = createInsertSchema(eventTemplates);
export const eventTemplateUpdateSchema = createUpdateSchema(
    eventTemplates,
).required({ id: true });
export const expandedEventTemplateUpdateSchema = z.object({
    ...eventTemplateUpdateSchema.shape,
    remindersDelete: z.array(z.number()),
    remindersUpdate: z.array(reminderTemplateUpdateSchema),
    remindersInsert: z.array(reminderTemplateInsertSchema),
    tags: z.array(tagInsertSchema),
});
