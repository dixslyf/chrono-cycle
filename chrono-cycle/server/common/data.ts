import { z } from "zod";

export type ProjectTemplateOverview = {
    id: string; // Encoded ID.
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
};

export type EventTemplate = {
    id: string; // Encoded ID.
    name: string;
    offsetDays: number;
    duration: number;
    note: string;
    eventType: "task" | "activity";
    autoReschedule: boolean;
    projectTemplateId: string;
    updatedAt: Date;
    reminders: ReminderTemplate[];
    tags: Tag[];
};

export type ReminderTemplate = {
    id: string; // Encoded ID.
    daysBeforeEvent: number;
    time: string;
    emailNotifications: boolean;
    desktopNotifications: boolean;
};

export type Tag = {
    id: string; // Encoded ID.
    name: string;
};

export const tagNameSchema = z
    .string()
    .nonempty("Tag cannot be empty")
    .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Tag can only contain alphanumeric characters, dashes and underscores",
    );
