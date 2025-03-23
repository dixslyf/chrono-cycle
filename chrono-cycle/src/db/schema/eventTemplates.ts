import { InferSelectModel, sql } from "drizzle-orm";
import {
    boolean,
    check,
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
import { z, type ZodTypeDef } from "zod";

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

export const eventTemplates = pgTable(
    "event_templates",
    {
        id: serial("id").primaryKey().unique(),
        name: text("name").notNull(),
        offsetDays: integer("offset_days").notNull(),
        duration: integer("duration").notNull(),
        note: text("note").notNull().default(""),
        eventType: eventTypeEnum("event_type").notNull(),
        autoReschedule: boolean("auto_reschedule").notNull(),
        updatedAt: timestamp("updated_at", {
            withTimezone: true,
            mode: "date",
        })
            .notNull()
            .defaultNow(),
        projectTemplateId: integer("project_template_id")
            .notNull()
            .references(() => projectTemplates.id, { onDelete: "cascade" }),
    },
    (t) => [
        check("event_templates_nonempty_name", sql`TRIM(${t.name}) <> ''`),
        check(
            "event_templates_duration_check",
            sql`((${t.eventType} = 'task' AND ${t.duration} = 1) OR (${t.eventType} = 'activity' AND ${t.duration} >= 1))`,
        ),
        check("event_templates_offset_days_check", sql`${t.offsetDays} >= 0`),
    ],
);

export type DbEventTemplate = InferSelectModel<typeof eventTemplates>;
export type DbEventTemplateInsert = z.input<typeof eventTemplateInsertSchema>;
export type DbEventTemplateUpdate = z.input<typeof eventTemplateUpdateSchema>;

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

export const rawEventTemplateInsertSchema = createInsertSchema(eventTemplates, {
    offsetDays: (schema) => schema.min(0),
    name: (schema) => schema.nonempty(),
}).omit({ updatedAt: true });

export function refineRawEventTemplateInsertSchema<
    Output extends { eventType: "task" | "activity"; duration: number },
    Def extends ZodTypeDef,
    Input,
>(schema: z.ZodType<Output, Def, Input>) {
    return schema
        .refine(
            (val) => (val.eventType === "task" ? val.duration === 1 : true),
            "Tasks must have a duration of 1",
        )
        .refine(
            (val) => (val.eventType === "activity" ? val.duration >= 1 : true),
            "Activities must have a duration of at least 1",
        );
}

export const eventTemplateInsertSchema = refineRawEventTemplateInsertSchema(
    rawEventTemplateInsertSchema,
);

export const eventTemplateUpdateSchema = createUpdateSchema(eventTemplates, {
    offsetDays: (schema) => schema.min(0),
    name: (schema) => schema.nonempty(),
})
    .omit({ eventType: true, projectTemplateId: true })
    .required({ id: true });

export const expandedEventTemplateUpdateSchema =
    eventTemplateUpdateSchema.extend({
        remindersDelete: z.array(z.number()),
        remindersUpdate: z.array(reminderTemplateUpdateSchema),
        remindersInsert: z.array(reminderTemplateInsertSchema),
        tags: z.array(tagInsertSchema),
    });
