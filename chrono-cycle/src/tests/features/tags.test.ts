import * as E from "fp-ts/Either";
import { revalidatePath } from "next/cache";
import { describe, expect, it } from "vitest";

import { ValidationError } from "@/common/errors";

import { createEventTemplateAction } from "@/features/event-templates/create/action";
import { updateEventTemplateAction } from "@/features/event-templates/update/action";
import { createProjectTemplateAction } from "@/features/project-templates/create/action";

describe("Tag server action", () => {
    it("should return validation error if payload has wrong types", async () => {
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
        const result = await createEventTemplateAction({
            name: "Event",
            offsetDays: 1,
            duration: 1,
            note: "Note",
            eventType: "task",
            autoReschedule: true,
            projectTemplateId: projectTemplateIdFormTest,
            reminders: [],
            tags: [1234 as unknown as string],
        });

        expect(result).toEqualLeft(
            ValidationError({
                tags: expect.any(Array),
            }),
        );
    });

    it("should return validation error if tag name is empty", async () => {
        const createProjectTemplateResult = await createProjectTemplateAction({
            name: "New Project",
            description: "Description",
        });
        if (E.isLeft(createProjectTemplateResult)) {
            throw new Error(
                "Create project template action is not implemented correctly!",
            );
        }
        const projectTemplate = createProjectTemplateResult.right;
        const projectTemplateIdFormTest = projectTemplate.id;
        const result = await createEventTemplateAction({
            name: "Event",
            offsetDays: 1,
            duration: 1,
            note: "Note",
            eventType: "task",
            autoReschedule: true,
            projectTemplateId: projectTemplateIdFormTest,
            reminders: [],
            tags: [" "],
        });
        expect(result).toEqualLeft(
            ValidationError({
                tags: expect.any(Array),
            }),
        );
    });

    it("should return validation error if tag name contains special characters other than dashes and underscores", async () => {
        const createProjectTemplateResult = await createProjectTemplateAction({
            name: "New Project",
            description: "Description",
        });
        if (E.isLeft(createProjectTemplateResult)) {
            throw new Error(
                "Create project template action is not implemented correctly!",
            );
        }
        const projectTemplate = createProjectTemplateResult.right;
        const projectTemplateIdFormTest = projectTemplate.id;
        const result = await createEventTemplateAction({
            name: "Event",
            offsetDays: 1,
            duration: 1,
            note: "Note",
            eventType: "task",
            autoReschedule: true,
            projectTemplateId: projectTemplateIdFormTest,
            reminders: [],
            tags: ["@#@$"],
        });
        expect(result).toEqualLeft(
            ValidationError({
                tags: expect.any(Array),
            }),
        );
    });

    it("should return validation error if tag name contains empty spaces", async () => {
        const createProjectTemplateResult = await createProjectTemplateAction({
            name: "New Project",
            description: "Description",
        });
        if (E.isLeft(createProjectTemplateResult)) {
            throw new Error(
                "Create project template action is not implemented correctly!",
            );
        }
        const projectTemplate = createProjectTemplateResult.right;
        const projectTemplateIdFormTest = projectTemplate.id;
        const result = await createEventTemplateAction({
            name: "Event",
            offsetDays: 1,
            duration: 1,
            note: "Note",
            eventType: "task",
            autoReschedule: true,
            projectTemplateId: projectTemplateIdFormTest,
            reminders: [],
            tags: ["tag 1", "tag 2"],
        });
        expect(result).toEqualLeft(
            ValidationError({
                tags: expect.any(Array),
            }),
        );
    });

    it("should create a event template with tags successfully", async () => {
        const createProjectTemplateResult = await createProjectTemplateAction({
            name: "New Project",
            description: "Description",
        });
        if (E.isLeft(createProjectTemplateResult)) {
            throw new Error(
                "Create project template action is not implemented correctly!",
            );
        }
        const projectTemplate = createProjectTemplateResult.right;
        const projectTemplateIdFormTest = projectTemplate.id;
        const result = await createEventTemplateAction({
            name: "New Event",
            offsetDays: 1,
            duration: 1,
            note: "Note",
            eventType: "task",
            autoReschedule: true,
            projectTemplateId: projectTemplateIdFormTest,
            reminders: [],
            tags: ["assignment", "school"],
        });
        expect(result).toBeRight();
    });

    it("should update an event template with tag successfully", async () => {
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
            name: "New Event Name",
            offsetDays: 1,
            duration: 1,
            note: "Note",
            autoReschedule: true,
            remindersDelete: [],
            remindersInsert: [],
            remindersUpdate: [],
            tags: ["tag"],
        });
        expect(result).toBeRight();
        expect(revalidatePath).toHaveBeenCalledWith("/templates");
    });
});
