import * as E from "fp-ts/Either";
import { revalidatePath } from "next/cache";
import { describe, expect, it } from "vitest";

import { EventTemplate } from "@/common/data/domain";
import { DoesNotExistError, ValidationError } from "@/common/errors";

import { createEventTemplateAction } from "@/features/event-templates/create/action";
import { updateEventTemplateAction } from "@/features/event-templates/update/action";
import { createProjectTemplateAction } from "@/features/project-templates/create/action";

describe("Update event template server action", () => {
    it("should return validation error if payload has wrong types", async () => {
        const result = await updateEventTemplateAction(null, {
            id: 1234 as unknown as string,
            name: 1234 as unknown as string,
            offsetDays: "hello" as unknown as number,
            duration: "hi" as unknown as number,
            note: 3456 as unknown as string,
            autoReschedule: 6789 as unknown as boolean,
            remindersDelete: 1234 as unknown as [],
            remindersInsert: 1234 as unknown as [],
            remindersUpdate: 1234 as unknown as [],
            tags: 4567 as unknown as string[],
        });

        expect(result).toEqualLeft(
            ValidationError({
                id: expect.any(Array),
                name: expect.any(Array),
                offsetDays: expect.any(Array),
                duration: expect.any(Array),
                note: expect.any(Array),
                autoReschedule: expect.any(Array),
                remindersDelete: expect.any(Array),
                remindersInsert: expect.any(Array),
                remindersUpdate: expect.any(Array),
                tags: expect.any(Array),
            }),
        );
    });

    it("should return DoesNotExistError if event template does not exist", async () => {
        const result = await updateEventTemplateAction(null, {
            id: "hXAOb0o7SCxM6yVp",
            name: "Event",
            offsetDays: 1,
            duration: 1,
            note: "Note",
            autoReschedule: true,
            remindersDelete: [],
            remindersInsert: [],
            remindersUpdate: [],
            tags: [],
        });
        expect(result).toEqualLeft(DoesNotExistError());
    });

    it("should return validation error if event template name is empty", async () => {
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
        const eventTemplate = createEventTemplateResult.right;
        const eventTemplateIdFormTest = eventTemplate.id;
        const result = await updateEventTemplateAction(null, {
            id: eventTemplateIdFormTest,
            name: "",
            offsetDays: 1,
            duration: 1,
            note: "Note",
            autoReschedule: true,
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

    it("should update an event template successfully when reminder and tag arrays are not specified", async () => {
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
        const eventTemplateIdFormTest = eventTemplate.id;
        const result = await updateEventTemplateAction(null, {
            id: eventTemplateIdFormTest,
            name: "New Event Name",
            offsetDays: 1,
            duration: 1,
            note: "Note",
            autoReschedule: true,
        });
        expect(result).toEqualRight({
            id: eventTemplateIdFormTest,
            name: "New Event Name",
            eventType: "task",
            offsetDays: 1,
            duration: 1,
            note: "Note",
            autoReschedule: true,
            reminders: [],
            updatedAt: expect.any(Date),
            projectTemplateId: projectTemplate.id,
            tags: [],
        } satisfies EventTemplate);
        expect(revalidatePath).toHaveBeenCalledWith("/templates");
    });

    it("should update an event template successfully when reminder arrays are empty", async () => {
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
        const eventTemplateIdFormTest = eventTemplate.id;
        const result = await updateEventTemplateAction(null, {
            id: eventTemplateIdFormTest,
            name: "New Event Name",
            offsetDays: 1,
            duration: 1,
            note: "Note",
            autoReschedule: true,
            remindersDelete: [],
            remindersInsert: [],
            remindersUpdate: [],
            tags: [],
        });
        expect(result).toEqualRight({
            id: eventTemplateIdFormTest,
            name: "New Event Name",
            eventType: "task",
            offsetDays: 1,
            duration: 1,
            note: "Note",
            autoReschedule: true,
            reminders: [],
            updatedAt: expect.any(Date),
            projectTemplateId: projectTemplate.id,
            tags: [],
        } satisfies EventTemplate);
        expect(revalidatePath).toHaveBeenCalledWith("/templates");
    });

    it("should update an event template successfully when deleting reminders", async () => {
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
        const result = await updateEventTemplateAction(null, {
            id: eventTemplate.id,
            remindersDelete: [
                eventTemplate.reminders[0].id,
                eventTemplate.reminders[1].id,
                eventTemplate.reminders[2].id,
            ],
        });
        expect(result).toEqualRight({
            id: eventTemplate.id,
            name: "Event",
            offsetDays: 1,
            duration: 1,
            note: "Note",
            eventType: "task",
            autoReschedule: true,
            projectTemplateId: projectTemplate.id,
            updatedAt: expect.any(Date),
            reminders: [],
            tags: [],
        } satisfies EventTemplate);
        expect(revalidatePath).toHaveBeenCalledWith("/templates");
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
        const result = await updateEventTemplateAction(null, {
            id: eventTemplate.id,
            remindersInsert: [
                { daysBeforeEvent: 0, time: "09:00" },
                { daysBeforeEvent: 1, time: "09:00" },
                { daysBeforeEvent: 2, time: "09:00" },
            ],
        });
        expect(result).toEqualRight({
            id: eventTemplate.id,
            name: "Event",
            offsetDays: 1,
            duration: 1,
            note: "Note",
            eventType: "task",
            autoReschedule: true,
            projectTemplateId: projectTemplate.id,
            updatedAt: expect.any(Date),
            reminders: [
                {
                    id: expect.any(String),
                    eventTemplateId: eventTemplate.id,
                    daysBeforeEvent: 0,
                    time: "09:00:00",
                    emailNotifications: true,
                    desktopNotifications: true,
                },
                {
                    id: expect.any(String),
                    eventTemplateId: eventTemplate.id,
                    daysBeforeEvent: 1,
                    time: "09:00:00",
                    emailNotifications: true,
                    desktopNotifications: true,
                },
                {
                    id: expect.any(String),
                    eventTemplateId: eventTemplate.id,
                    daysBeforeEvent: 2,
                    time: "09:00:00",
                    emailNotifications: true,
                    desktopNotifications: true,
                },
            ],
            tags: [],
        } satisfies EventTemplate);
        expect(revalidatePath).toHaveBeenCalledWith("/templates");
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
        const result = await updateEventTemplateAction(null, {
            id: eventTemplate.id,
            remindersUpdate: [
                {
                    id: eventTemplate.reminders[0].id,
                    daysBeforeEvent: 1,
                    time: "10:00",
                    emailNotifications: false,
                    desktopNotifications: false,
                },
                {
                    id: eventTemplate.reminders[1].id,
                    daysBeforeEvent: 2,
                    time: "11:00",
                    emailNotifications: false,
                    desktopNotifications: false,
                },
                {
                    id: eventTemplate.reminders[2].id,
                    daysBeforeEvent: 3,
                    time: "12:00",
                    emailNotifications: false,
                    desktopNotifications: false,
                },
            ],
        });
        expect(result).toEqualRight({
            id: eventTemplate.id,
            name: "Event",
            offsetDays: 1,
            duration: 1,
            note: "Note",
            eventType: "task",
            autoReschedule: true,
            projectTemplateId: projectTemplate.id,
            updatedAt: expect.any(Date),
            reminders: [
                {
                    id: eventTemplate.reminders[0].id,
                    eventTemplateId: eventTemplate.id,
                    daysBeforeEvent: 1,
                    time: "10:00:00",
                    emailNotifications: false,
                    desktopNotifications: false,
                },
                {
                    id: eventTemplate.reminders[1].id,
                    eventTemplateId: eventTemplate.id,
                    daysBeforeEvent: 2,
                    time: "11:00:00",
                    emailNotifications: false,
                    desktopNotifications: false,
                },
                {
                    id: eventTemplate.reminders[2].id,
                    eventTemplateId: eventTemplate.id,
                    daysBeforeEvent: 3,
                    time: "12:00:00",
                    emailNotifications: false,
                    desktopNotifications: false,
                },
            ],
            tags: [],
        } satisfies EventTemplate);
        expect(revalidatePath).toHaveBeenCalledWith("/templates");
    });

    it("should update an event template successfully when inserting, deleting and updating reminders", async () => {
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
        const eventTemplate = createEventTemplateResult.right;
        const result = await updateEventTemplateAction(null, {
            id: eventTemplate.id,
            remindersDelete: [eventTemplate.reminders[0].id],
            remindersUpdate: [
                {
                    id: eventTemplate.reminders[1].id,
                    daysBeforeEvent: 1,
                    time: "10:00",
                    emailNotifications: false,
                    desktopNotifications: false,
                },
            ],
            remindersInsert: [{ daysBeforeEvent: 2, time: "09:00" }],
        });
        expect(result).toEqualRight({
            id: eventTemplate.id,
            name: "Event",
            offsetDays: 1,
            duration: 1,
            note: "Note",
            eventType: "task",
            autoReschedule: true,
            projectTemplateId: projectTemplate.id,
            updatedAt: expect.any(Date),
            reminders: [
                {
                    id: eventTemplate.reminders[1].id,
                    eventTemplateId: eventTemplate.id,
                    daysBeforeEvent: 1,
                    time: "10:00:00",
                    emailNotifications: false,
                    desktopNotifications: false,
                },
                {
                    id: expect.any(String),
                    eventTemplateId: eventTemplate.id,
                    daysBeforeEvent: 2,
                    time: "09:00:00",
                    emailNotifications: true,
                    desktopNotifications: true,
                },
            ],
            tags: [],
        } satisfies EventTemplate);
        expect(revalidatePath).toHaveBeenCalledWith("/templates");
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
        const eventTemplate = createEventTemplateResult.right;

        const result = await updateEventTemplateAction(null, {
            id: eventTemplate.id,
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
        const eventTemplate = createEventTemplateResult.right;

        const result = await updateEventTemplateAction(null, {
            id: eventTemplate.id,
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
        const eventTemplate = createEventTemplateResult.right;

        const result = await updateEventTemplateAction(null, {
            id: eventTemplate.id,
            tags: ["@#@$"],
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
        const eventTemplate = createEventTemplateResult.right;

        const result = await updateEventTemplateAction(null, {
            id: eventTemplate.id,
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
        const result = await updateEventTemplateAction(null, {
            id: eventTemplate.id,
            tags: ["a", "b"],
        });
        expect(result).toEqualRight({
            id: eventTemplate.id,
            name: "Event",
            offsetDays: 1,
            duration: 1,
            note: "Note",
            eventType: "task",
            autoReschedule: true,
            projectTemplateId: projectTemplate.id,
            updatedAt: expect.any(Date),
            reminders: [],
            tags: [
                { id: expect.any(String), name: "a" },
                { id: expect.any(String), name: "b" },
            ],
        } satisfies EventTemplate);
        expect(revalidatePath).toHaveBeenCalledWith("/templates");
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
        const result = await updateEventTemplateAction(null, {
            id: eventTemplate.id,
            tags: ["c", "a"],
        });
        expect(result).toEqualRight({
            id: eventTemplate.id,
            name: "Event",
            offsetDays: 1,
            duration: 1,
            note: "Note",
            eventType: "task",
            autoReschedule: true,
            projectTemplateId: projectTemplate.id,
            updatedAt: expect.any(Date),
            reminders: [],
            tags: [
                { id: expect.any(String), name: "c" },
                { id: eventTemplate.tags[0].id, name: "a" },
            ],
        } satisfies EventTemplate);
        expect(revalidatePath).toHaveBeenCalledWith("/templates");
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
        const result = await updateEventTemplateAction(null, {
            id: eventTemplate.id,
            tags: [],
        });
        expect(result).toEqualRight({
            id: eventTemplate.id,
            name: "Event",
            offsetDays: 1,
            duration: 1,
            note: "Note",
            eventType: "task",
            autoReschedule: true,
            projectTemplateId: projectTemplate.id,
            updatedAt: expect.any(Date),
            reminders: [],
            tags: [],
        } satisfies EventTemplate);
        expect(revalidatePath).toHaveBeenCalledWith("/templates");
    });
});
