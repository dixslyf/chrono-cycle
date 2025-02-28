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
};
