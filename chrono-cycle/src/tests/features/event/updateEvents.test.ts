import * as E from "fp-ts/Either";
import { revalidatePath } from "next/cache";
import { describe, expect, it } from "vitest";

import { Event } from "@/common/data/domain";
import { ValidationError } from "@/common/errors";

import { createEventTemplateAction } from "@/features/event-templates/create/action";
import { listEventsAction } from "@/features/events/list/action";
import { updateEventAction } from "@/features/events/update/action";
import { createProjectTemplateAction } from "@/features/project-templates/create/action";
import { createProjectAction } from "@/features/projects/create/action";

describe("Update event server action", () => {
    it("should return validation error if payload has wrong types", async () => {
        const result = await updateEventAction(null, {
            id: 1234 as unknown as string,
            name: 1234 as unknown as string,
            startDate: 3456 as unknown as string,
            duration: "hi" as unknown as number,
            note: 3456 as unknown as string,
            autoReschedule: 6789 as unknown as boolean,
            status: 1234 as unknown as
                | "none"
                | "not started"
                | "in progress"
                | "completed",
            notificationsEnabled: 6789 as unknown as boolean,
            remindersDelete: 1234 as unknown as [],
            remindersInsert: 1234 as unknown as [],
            remindersUpdate: 1234 as unknown as [],
            tags: 4567 as unknown as string[],
        });

        expect(result).toEqualLeft(
            ValidationError({
                id: expect.any(Array),
                name: expect.any(Array),
                startDate: expect.any(Array),
                duration: expect.any(Array),
                note: expect.any(Array),
                autoReschedule: expect.any(Array),
                status: expect.any(Array),
                notificationsEnabled: expect.any(Array),
                remindersDelete: expect.any(Array),
                remindersInsert: expect.any(Array),
                remindersUpdate: expect.any(Array),
                tags: expect.any(Array),
            }),
        );
    });

    it("should return validation error if event name is empty", async () => {
        const createProjectTemplateResult = await createProjectTemplateAction({
            name: "New Project Name",
            description: "Description of a new project",
        });
        if (E.isLeft(createProjectTemplateResult)) {
            throw new Error(
                "Create project template action is not implemented correctly!",
            );
        }
        const projectTemplate = createProjectTemplateResult.right;
        const projectTemplateIdFormTest = projectTemplate.id;
        const createEventTemplateResult = await createEventTemplateAction({
            name: "Event",
            offsetDays: 1,
            duration: 1,
            note: "Note",
            eventType: "task",
            autoReschedule: true,
            projectTemplateId: projectTemplateIdFormTest,
            reminders: [],
            tags: [],
        });
        if (E.isLeft(createEventTemplateResult)) {
            throw new Error(
                "Create event template action is not implemented correctly!",
            );
        }
        const createProjectResult = await createProjectAction({
            name: "Test Project",
            description: "Test Description",
            startsAt: "2025-01-01",
            projectTemplateId: projectTemplate.id,
        });
        if (E.isLeft(createProjectResult)) {
            throw new Error(
                "Create event template action is not implemented correctly!",
            );
        }
        const project = createProjectResult.right;
        const event = project.events[0];
        const date = project.events[0].startDate;
        const formattedDate = date.toISOString().split("T")[0];
        const result = await updateEventAction(null, {
            id: event.id,
            name: "",
            startDate: formattedDate,
            duration: 1,
            note: "Note",
            autoReschedule: true,
            status: "in progress",
            notificationsEnabled: false,
            remindersDelete: [],
            remindersInsert: [],
            remindersUpdate: [],
            tags: [],
        });
        expect(result).toEqualLeft(
            ValidationError({
                name: expect.any(Array),
            }),
        );
    });

    it("should update an event successfully when reminder arrays are empty", async () => {
        const createProjectTemplateResult = await createProjectTemplateAction({
            name: "New Project Name",
            description: "Description of a new project",
        });
        if (E.isLeft(createProjectTemplateResult)) {
            throw new Error(
                "Create project template action is not implemented correctly!",
            );
        }
        const projectTemplate = createProjectTemplateResult.right;
        const createEventTemplateResult = await createEventTemplateAction({
            name: "Event",
            offsetDays: 0,
            duration: 1,
            note: "Note",
            eventType: "activity",
            autoReschedule: true,
            projectTemplateId: projectTemplate.id,
            reminders: [],
            tags: [],
        });
        if (E.isLeft(createEventTemplateResult)) {
            throw new Error(
                "Create event template action is not implemented correctly!",
            );
        }
        const eventTemplate = createEventTemplateResult.right;
        const createProjectResult = await createProjectAction({
            name: "Test Project",
            description: "Test Description",
            startsAt: "2025-04-02",
            projectTemplateId: projectTemplate.id,
        });
        if (E.isLeft(createProjectResult)) {
            throw new Error(
                "Create project action is not implemented correctly!",
            );
        }
        const project = createProjectResult.right;
        const result = await updateEventAction(null, {
            id: project.events[0].id,
            name: "New Event",
            startDate: "2025-04-02",
            duration: 3,
            status: "none",
        });
        expect(result).toBeRight();
        expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
        const listResult = await listEventsAction(null, {
            projectId: project.id,
        });
        expect(listResult).toEqualRight([
            {
                id: project.events[0].id,
                projectId: project.id,
                name: "New Event",
                startDate: expect.any(Date),
                duration: 3,
                note: "Note",
                eventType: "activity",
                autoReschedule: true,
                updatedAt: expect.any(Date),
                status: project.events[0].status,
                notificationsEnabled: true,
                eventTemplateId: eventTemplate.id,
                reminders: [],
                tags: [],
            },
        ] satisfies Event[]);
    });

    it("should update an event successfully when deleting reminders", async () => {
        const createProjectTemplateResult = await createProjectTemplateAction({
            name: "New Project Name",
            description: "Description of a new project",
        });
        if (E.isLeft(createProjectTemplateResult)) {
            throw new Error(
                "Create project template action is not implemented correctly!",
            );
        }
        const projectTemplate = createProjectTemplateResult.right;
        const createEventTemplateResult = await createEventTemplateAction({
            name: "Event",
            offsetDays: 1,
            duration: 1,
            note: "Note",
            eventType: "task",
            autoReschedule: true,
            projectTemplateId: projectTemplate.id,
            reminders: [
                { daysBeforeEvent: 0, time: "09:00" },
                { daysBeforeEvent: 1, time: "09:00" },
                { daysBeforeEvent: 2, time: "09:00" },
            ],
            tags: [],
        });
        if (E.isLeft(createEventTemplateResult)) {
            throw new Error(
                "Create event template action is not implemented correctly!",
            );
        }
        const eventTemplate = createEventTemplateResult.right;
        const createProjectResult = await createProjectAction({
            name: "Test Project",
            description: "Test Description",
            startsAt: "2025-01-01",
            projectTemplateId: projectTemplate.id,
        });
        if (E.isLeft(createProjectResult)) {
            throw new Error(
                "Create project action is not implemented correctly!",
            );
        }
        const project = createProjectResult.right;
        const event = project.events[0];
        const result = await updateEventAction(null, {
            id: event.id,
            startDate: "2025-01-01",
            remindersDelete: [
                event.reminders[0].id,
                event.reminders[1].id,
                event.reminders[2].id,
            ],
        });
        if (E.isLeft(result)) {
            throw new Error("Update Event is not implemented correctly!");
        }
        const listResult = await listEventsAction(null, {
            projectId: project.id,
        });
        expect(listResult).toEqualRight([
            {
                id: project.events[0].id,
                projectId: project.id,
                name: "Event",
                startDate: expect.any(Date),
                duration: 1,
                note: "Note",
                eventType: "task",
                autoReschedule: true,
                updatedAt: expect.any(Date),
                status: project.events[0].status,
                notificationsEnabled: true,
                eventTemplateId: eventTemplate.id,
                reminders: [],
                tags: [],
            },
        ] satisfies Event[]);
    });

    it("should update an event template successfully when inserting reminders", async () => {
        const createProjectTemplateResult = await createProjectTemplateAction({
            name: "New Project Name",
            description: "Description of a new project",
        });
        if (E.isLeft(createProjectTemplateResult)) {
            throw new Error(
                "Create project template action is not implemented correctly!",
            );
        }
        const projectTemplate = createProjectTemplateResult.right;
        const createEventTemplateResult = await createEventTemplateAction({
            name: "Event",
            offsetDays: 1,
            duration: 1,
            note: "Note",
            eventType: "task",
            autoReschedule: true,
            projectTemplateId: projectTemplate.id,
            reminders: [],
            tags: [],
        });
        if (E.isLeft(createEventTemplateResult)) {
            throw new Error(
                "Create event template action is not implemented correctly!",
            );
        }
        const eventTemplate = createEventTemplateResult.right;
        const createProjectResult = await createProjectAction({
            name: "Test Project",
            description: "Test Description",
            startsAt: "2025-01-01",
            projectTemplateId: projectTemplate.id,
        });
        if (E.isLeft(createProjectResult)) {
            throw new Error(
                "Create project action is not implemented correctly!",
            );
        }
        const project = createProjectResult.right;
        const event = project.events[0];
        const result = await updateEventAction(null, {
            id: event.id,
            startDate: "2025-01-01",
            remindersInsert: [
                {
                    triggerTime: "2025-01-01T01:00:00.000Z",
                    emailNotifications: true,
                    desktopNotifications: false,
                },
            ],
        });
        if (E.isLeft(result)) {
            throw new Error("Update Event is not implemented correctly!");
        }
        const listResult = await listEventsAction(null, {
            projectId: project.id,
        });

        expect(listResult).toEqualRight([
            {
                id: event.id,
                projectId: project.id,
                name: "Event",
                startDate: new Date("2025-01-01T00:00:00.000Z"),
                duration: 1,
                eventTemplateId: eventTemplate.id,
                notificationsEnabled: true,
                note: "Note",
                eventType: "task",
                status: "not started",
                autoReschedule: true,
                reminders: [
                    {
                        id: expect.any(String),
                        emailNotifications: true,
                        eventId: event.id,
                        reminderTemplateId: null,
                        desktopNotifications: false,
                        triggerTime: new Date("2025-01-01T01:00:00.000Z"),
                    },
                ],
                tags: [],
                updatedAt: expect.any(Date),
            },
        ]);
    });

    it("should update an event template successfully when updating reminders", async () => {
        const createProjectTemplateResult = await createProjectTemplateAction({
            name: "New Project Name",
            description: "Description of a new project",
        });
        if (E.isLeft(createProjectTemplateResult)) {
            throw new Error(
                "Create project template action is not implemented correctly!",
            );
        }
        const projectTemplate = createProjectTemplateResult.right;
        const createEventTemplateResult = await createEventTemplateAction({
            name: "Event",
            offsetDays: 1,
            duration: 1,
            note: "Note",
            eventType: "task",
            autoReschedule: true,
            projectTemplateId: projectTemplate.id,
            reminders: [{ daysBeforeEvent: 0, time: "09:00" }],
            tags: [],
        });
        if (E.isLeft(createEventTemplateResult)) {
            throw new Error(
                "Create event template action is not implemented correctly!",
            );
        }
        const eventTemplate = createEventTemplateResult.right;

        const createProjectResult = await createProjectAction({
            name: "Test Project",
            description: "Test Description",
            startsAt: "2025-01-01",
            projectTemplateId: projectTemplate.id,
        });
        if (E.isLeft(createProjectResult)) {
            throw new Error(
                "Create project action is not implemented correctly!",
            );
        }
        const project = createProjectResult.right;
        const event = project.events[0];
        const result = await updateEventAction(null, {
            id: event.id,
            startDate: "2025-01-01",
            remindersUpdate: [
                {
                    id: event.reminders[0].id,
                    triggerTime: "2025-01-01T05:00:00.000Z",
                    emailNotifications: true,
                    desktopNotifications: false,
                },
            ],
        });
        if (E.isLeft(result)) {
            throw new Error("Update Event is not implemented correctly!");
        }
        const listResult = await listEventsAction(null, {
            projectId: project.id,
        });

        expect(listResult).toEqualRight([
            {
                id: event.id,
                projectId: project.id,
                name: "Event",
                startDate: new Date("2025-01-01T00:00:00.000Z"),
                duration: 1,
                eventTemplateId: eventTemplate.id,
                notificationsEnabled: true,
                note: "Note",
                eventType: "task",
                status: "not started",
                autoReschedule: true,
                reminders: [
                    {
                        id: event.reminders[0].id,
                        emailNotifications: true,
                        eventId: event.id,
                        reminderTemplateId:
                            event.reminders[0].reminderTemplateId,
                        desktopNotifications: false,
                        triggerTime: new Date("2025-01-01T05:00:00.000Z"),
                    },
                ],
                tags: [],
                updatedAt: expect.any(Date),
            },
        ]);
    });

    it("should return validation error if tags have wrong types", async () => {
        const createProjectTemplateResult = await createProjectTemplateAction({
            name: "New Project Name",
            description: "Description of a new project",
        });
        if (E.isLeft(createProjectTemplateResult)) {
            throw new Error(
                "Create project template action is not implemented correctly!",
            );
        }
        const projectTemplate = createProjectTemplateResult.right;
        const createEventTemplateResult = await createEventTemplateAction({
            name: "Event",
            offsetDays: 1,
            duration: 1,
            note: "Note",
            eventType: "task",
            autoReschedule: true,
            projectTemplateId: projectTemplate.id,
            reminders: [
                { daysBeforeEvent: 0, time: "09:00" },
                { daysBeforeEvent: 1, time: "09:00" },
            ],
            tags: [],
        });
        if (E.isLeft(createEventTemplateResult)) {
            throw new Error(
                "Create event template action is not implemented correctly!",
            );
        }
        const createProjectResult = await createProjectAction({
            name: "Test Project",
            description: "Test Description",
            startsAt: "2025-01-01",
            projectTemplateId: projectTemplate.id,
        });
        if (E.isLeft(createProjectResult)) {
            throw new Error(
                "Create project action is not implemented correctly!",
            );
        }
        const project = createProjectResult.right;
        const result = await updateEventAction(null, {
            id: project.events[0].id,
            startDate: "2025-01-01",
            tags: [1234 as unknown as string, 5678 as unknown as string],
        });
        expect(result).toEqualLeft(
            ValidationError({
                tags: expect.any(Array),
            }),
        );
    });

    it("should return validation error if tag name is empty", async () => {
        const createProjectTemplateResult = await createProjectTemplateAction({
            name: "New Project Name",
            description: "Description of a new project",
        });
        if (E.isLeft(createProjectTemplateResult)) {
            throw new Error(
                "Create project template action is not implemented correctly!",
            );
        }
        const projectTemplate = createProjectTemplateResult.right;
        const createEventTemplateResult = await createEventTemplateAction({
            name: "Event",
            offsetDays: 1,
            duration: 1,
            note: "Note",
            eventType: "task",
            autoReschedule: true,
            projectTemplateId: projectTemplate.id,
            reminders: [
                { daysBeforeEvent: 0, time: "09:00" },
                { daysBeforeEvent: 1, time: "09:00" },
            ],
            tags: [],
        });
        if (E.isLeft(createEventTemplateResult)) {
            throw new Error(
                "Create event template action is not implemented correctly!",
            );
        }
        const createProjectResult = await createProjectAction({
            name: "Test Project",
            description: "Test Description",
            startsAt: "2025-01-01",
            projectTemplateId: projectTemplate.id,
        });
        if (E.isLeft(createProjectResult)) {
            throw new Error(
                "Create project action is not implemented correctly!",
            );
        }
        const project = createProjectResult.right;
        const result = await updateEventAction(null, {
            id: project.events[0].id,
            startDate: "2025-01-01",
            tags: [""],
        });
        expect(result).toEqualLeft(
            ValidationError({
                tags: expect.any(Array),
            }),
        );
    });

    it("should return validation error if tag name contains special characters other than dashes and underscores", async () => {
        const createProjectTemplateResult = await createProjectTemplateAction({
            name: "New Project Name",
            description: "Description of a new project",
        });
        if (E.isLeft(createProjectTemplateResult)) {
            throw new Error(
                "Create project template action is not implemented correctly!",
            );
        }
        const projectTemplate = createProjectTemplateResult.right;
        const createEventTemplateResult = await createEventTemplateAction({
            name: "Event",
            offsetDays: 1,
            duration: 1,
            note: "Note",
            eventType: "task",
            autoReschedule: true,
            projectTemplateId: projectTemplate.id,
            reminders: [
                { daysBeforeEvent: 0, time: "09:00" },
                { daysBeforeEvent: 1, time: "09:00" },
            ],
            tags: [],
        });
        if (E.isLeft(createEventTemplateResult)) {
            throw new Error(
                "Create event template action is not implemented correctly!",
            );
        }
        const createProjectResult = await createProjectAction({
            name: "Test Project",
            description: "Test Description",
            startsAt: "2025-01-01",
            projectTemplateId: projectTemplate.id,
        });
        if (E.isLeft(createProjectResult)) {
            throw new Error(
                "Create project action is not implemented correctly!",
            );
        }
        const project = createProjectResult.right;
        const result = await updateEventAction(null, {
            id: project.events[0].id,
            startDate: "2025-01-01",
            tags: ["@#@%"],
        });
        expect(result).toEqualLeft(
            ValidationError({
                tags: expect.any(Array),
            }),
        );
    });

    it("should return validation error if tag name contains spaces", async () => {
        const createProjectTemplateResult = await createProjectTemplateAction({
            name: "New Project Name",
            description: "Description of a new project",
        });
        if (E.isLeft(createProjectTemplateResult)) {
            throw new Error(
                "Create project template action is not implemented correctly!",
            );
        }
        const projectTemplate = createProjectTemplateResult.right;

        const createEventTemplateResult = await createEventTemplateAction({
            name: "Event",
            offsetDays: 1,
            duration: 1,
            note: "Note",
            eventType: "task",
            autoReschedule: true,
            projectTemplateId: projectTemplate.id,
            reminders: [
                { daysBeforeEvent: 0, time: "09:00" },
                { daysBeforeEvent: 1, time: "09:00" },
            ],
            tags: [],
        });
        if (E.isLeft(createEventTemplateResult)) {
            throw new Error(
                "Create event template action is not implemented correctly!",
            );
        }
        const createProjectResult = await createProjectAction({
            name: "Test Project",
            description: "Test Description",
            startsAt: "2025-01-01",
            projectTemplateId: projectTemplate.id,
        });
        if (E.isLeft(createProjectResult)) {
            throw new Error(
                "Create project action is not implemented correctly!",
            );
        }
        const project = createProjectResult.right;
        const result = await updateEventAction(null, {
            id: project.events[0].id,
            startDate: "2025-01-01",
            tags: ["tag 1", "tag 2"],
        });
        expect(result).toEqualLeft(
            ValidationError({
                tags: expect.any(Array),
            }),
        );
    });

    it("should add tags to an event template successfully", async () => {
        const createProjectTemplateResult = await createProjectTemplateAction({
            name: "New Project Name",
            description: "Description of a new project",
        });
        if (E.isLeft(createProjectTemplateResult)) {
            throw new Error(
                "Create project template action is not implemented correctly!",
            );
        }
        const projectTemplate = createProjectTemplateResult.right;
        const createEventTemplateResult = await createEventTemplateAction({
            name: "Event",
            offsetDays: 1,
            duration: 1,
            note: "Note",
            eventType: "task",
            autoReschedule: true,
            projectTemplateId: projectTemplate.id,
            reminders: [],
            tags: [],
        });
        if (E.isLeft(createEventTemplateResult)) {
            throw new Error(
                "Create event template action is not implemented correctly!",
            );
        }
        const eventTemplate = createEventTemplateResult.right;
        const createProjectResult = await createProjectAction({
            name: "Test Project",
            description: "Test Description",
            startsAt: "2025-01-01",
            projectTemplateId: projectTemplate.id,
        });
        if (E.isLeft(createProjectResult)) {
            throw new Error(
                "Create project action is not implemented correctly!",
            );
        }
        const project = createProjectResult.right;
        const result = await updateEventAction(null, {
            id: project.events[0].id,
            startDate: "2025-01-01",
            tags: ["b", "a"],
        });
        if (E.isLeft(result)) {
            throw new Error("Update Event is not implemented correctly!");
        }
        const listResult = await listEventsAction(null, {
            projectId: project.id,
        });
        expect(listResult).toEqualRight([
            {
                id: project.events[0].id,
                projectId: project.id,
                name: "Event",
                startDate: expect.any(Date),
                duration: 1,
                note: "Note",
                eventType: "task",
                autoReschedule: true,
                updatedAt: expect.any(Date),
                status: project.events[0].status,
                notificationsEnabled: true,
                eventTemplateId: eventTemplate.id,
                reminders: [],
                tags: [
                    { id: expect.any(String), name: "a" },
                    { id: expect.any(String), name: "b" },
                ],
            },
        ] satisfies Event[]);
    });

    it("should replace an event template's tags successfully", async () => {
        const createProjectTemplateResult = await createProjectTemplateAction({
            name: "New Project Name",
            description: "Description of a new project",
        });
        if (E.isLeft(createProjectTemplateResult)) {
            throw new Error(
                "Create project template action is not implemented correctly!",
            );
        }
        const projectTemplate = createProjectTemplateResult.right;
        const createEventTemplateResult = await createEventTemplateAction({
            name: "Event",
            offsetDays: 1,
            duration: 1,
            note: "Note",
            eventType: "task",
            autoReschedule: true,
            projectTemplateId: projectTemplate.id,
            reminders: [],
            tags: ["a", "b"],
        });
        if (E.isLeft(createEventTemplateResult)) {
            throw new Error(
                "Create event template action is not implemented correctly!",
            );
        }
        const eventTemplate = createEventTemplateResult.right;
        const createProjectResult = await createProjectAction({
            name: "Test Project",
            description: "Test Description",
            startsAt: "2025-01-01",
            projectTemplateId: projectTemplate.id,
        });
        if (E.isLeft(createProjectResult)) {
            throw new Error(
                "Create project action is not implemented correctly!",
            );
        }
        const project = createProjectResult.right;
        const result = await updateEventAction(null, {
            id: project.events[0].id,
            startDate: "2025-01-01",
            tags: ["c", "a"],
        });
        if (E.isLeft(result)) {
            throw new Error("Update Event is not implemented correctly!");
        }
        const listResult = await listEventsAction(null, {
            projectId: project.id,
        });
        expect(listResult).toEqualRight([
            {
                id: project.events[0].id,
                projectId: project.id,
                name: "Event",
                startDate: expect.any(Date),
                duration: 1,
                note: "Note",
                eventType: "task",
                autoReschedule: true,
                updatedAt: expect.any(Date),
                status: project.events[0].status,
                notificationsEnabled: true,
                eventTemplateId: eventTemplate.id,
                reminders: [],
                tags: [
                    { id: expect.any(String), name: "a" },
                    { id: expect.any(String), name: "c" },
                ],
            },
        ] satisfies Event[]);
    });

    it("should remove an event template's tags successfully", async () => {
        const createProjectTemplateResult = await createProjectTemplateAction({
            name: "New Project Name",
            description: "Description of a new project",
        });
        if (E.isLeft(createProjectTemplateResult)) {
            throw new Error(
                "Create project template action is not implemented correctly!",
            );
        }
        const projectTemplate = createProjectTemplateResult.right;
        const createEventTemplateResult = await createEventTemplateAction({
            name: "Event",
            offsetDays: 1,
            duration: 1,
            note: "Note",
            eventType: "task",
            autoReschedule: true,
            projectTemplateId: projectTemplate.id,
            reminders: [],
            tags: ["a", "b"],
        });
        if (E.isLeft(createEventTemplateResult)) {
            throw new Error(
                "Create event template action is not implemented correctly!",
            );
        }
        const eventTemplate = createEventTemplateResult.right;
        const createProjectResult = await createProjectAction({
            name: "Test Project",
            description: "Test Description",
            startsAt: "2025-01-01",
            projectTemplateId: projectTemplate.id,
        });
        if (E.isLeft(createProjectResult)) {
            throw new Error(
                "Create project action is not implemented correctly!",
            );
        }
        const project = createProjectResult.right;
        const result = await updateEventAction(null, {
            id: project.events[0].id,
            startDate: "2025-01-01",
            tags: [],
        });
        if (E.isLeft(result)) {
            throw new Error("Update Event is not implemented correctly!");
        }
        const listResult = await listEventsAction(null, {
            projectId: project.id,
        });
        expect(listResult).toEqualRight([
            {
                id: project.events[0].id,
                projectId: project.id,
                name: "Event",
                startDate: expect.any(Date),
                duration: 1,
                note: "Note",
                eventType: "task",
                autoReschedule: true,
                updatedAt: expect.any(Date),
                status: project.events[0].status,
                notificationsEnabled: true,
                eventTemplateId: eventTemplate.id,
                reminders: [],
                tags: [],
            },
        ] satisfies Event[]);
    });
});
