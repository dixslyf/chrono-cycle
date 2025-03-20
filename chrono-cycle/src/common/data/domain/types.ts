import { z } from "zod";

export type ProjectTemplateOverview = {
    id: string; // Encoded ID.
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
};

export type ProjectTemplate = {
    events: EventTemplate[];
} & ProjectTemplateOverview;

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
    eventTemplateId: string; // Encoded ID.
    daysBeforeEvent: number;
    time: string;
    emailNotifications: boolean;
    desktopNotifications: boolean;
};

export type ProjectOverview = {
    id: string; // Encoded ID.
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    startsAt: Date;
    projectTemplateId: string | null; // Encoded ID.
};

export type Project = {
    events: Event[];
} & ProjectOverview;

export type Event = {
    id: string; // Encoded ID.
    projectId: string; // Encoded ID.
    name: string;
    startDate: Date;
    duration: number;
    note: string;
    eventType: "task" | "activity";
    autoReschedule: boolean;
    updatedAt: Date;
    status: "none" | "not started" | "in progress" | "completed";
    notificationsEnabled: boolean;
    eventTemplateId: string | null; // Encoded ID.
    reminders: Reminder[];
    tags: Tag[];
};

export type Reminder = {
    id: string; // Encoded ID.
    eventId: string; // Encoded ID.
    triggerTime: Date;
    emailNotifications: boolean;
    desktopNotifications: boolean;
    reminderTemplateId: string | null; // Encoded ID.
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
