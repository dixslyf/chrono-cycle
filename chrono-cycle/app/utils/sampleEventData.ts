import { Event } from "@/server/common/data";

// Sample event data for testing the DisplayEventDetails component
export const sampleEvent: Event = {
    id: "event-123",
    projectId: "project-456",
    name: "Design User Interface",
    offsetDays: 5,
    duration: 7,
    note: "Focus on responsive design and accessibility features. Coordinate with the UX team for feedback.",
    eventType: "task",
    autoReschedule: true,
    updatedAt: new Date("2023-10-15T14:30:00"),
    status: "in progress",
    notificationsEnabled: true,
    eventTemplateId: "template-789",
    reminders: [
        {
            id: "reminder-1",
            daysBeforeEvent: 1,
            time: "09:00",
            emailNotifications: true,
            desktopNotifications: true,
            reminderTemplateId: "reminder-template-1",
        },
        {
            id: "reminder-2",
            daysBeforeEvent: 3,
            time: "14:30",
            emailNotifications: true,
            desktopNotifications: false,
            reminderTemplateId: null,
        },
    ],
    tags: [
        {
            id: "tag-1",
            name: "design",
        },
        {
            id: "tag-2",
            name: "high-priority",
        },
        {
            id: "tag-3",
            name: "frontend",
        },
    ],
};

// Another sample event with different data
export const sampleEvent2: Event = {
    id: "event-456",
    projectId: "project-456",
    name: "Backend API Integration",
    offsetDays: 12,
    duration: 10,
    note: "",
    eventType: "activity",
    autoReschedule: false,
    updatedAt: new Date("2023-10-20T09:15:00"),
    status: "not started",
    notificationsEnabled: true,
    eventTemplateId: null,
    reminders: [],
    tags: [],
};

// Sample event with completed status
export const sampleEvent3: Event = {
    id: "event-789",
    projectId: "project-456",
    name: "User Testing",
    offsetDays: 20,
    duration: 3,
    note: "Conduct user testing with 5-7 participants from the target demographic.",
    eventType: "activity",
    autoReschedule: true,
    updatedAt: new Date("2023-11-05T16:45:00"),
    status: "completed",
    notificationsEnabled: true,
    eventTemplateId: "template-123",
    reminders: [
        {
            id: "reminder-3",
            daysBeforeEvent: 2,
            time: "10:00",
            emailNotifications: true,
            desktopNotifications: true,
            reminderTemplateId: "reminder-template-2",
        },
    ],
    tags: [
        {
            id: "tag-4",
            name: "testing",
        },
        {
            id: "tag-5",
            name: "user-experience",
        },
    ],
};
