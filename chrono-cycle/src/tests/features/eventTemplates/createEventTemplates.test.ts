import * as E from "fp-ts/Either";
import { describe, expect, it } from "vitest";

import { DoesNotExistError, ValidationError } from "@/common/errors";

import { createEventTemplateAction } from "@/features/event-templates/create/action";
import { createProjectTemplateAction } from "@/features/project-templates/create/action";

describe("Create event template server action", () => {
    it("should return validation error if payload has wrong types", async () => {
        const result = await createEventTemplateAction({
            name: 1234 as unknown as string,
            offsetDays: "hello" as unknown as number,
            duration: "hi" as unknown as number,
            note: 3456 as unknown as string,
            eventType: 1234 as unknown as "task" | "activity",
            autoReschedule: 6789 as unknown as boolean,
            projectTemplateId: 1234 as unknown as string,
            reminders: 1234 as unknown as [],
            tags: 4567 as unknown as string[],
        });

        expect(result).toEqualLeft(
            ValidationError({
                name: expect.any(Array),
                offsetDays: expect.any(Array),
                duration: expect.any(Array),
                note: expect.any(Array),
                eventType: expect.any(Array),
                autoReschedule: expect.any(Array),
                projectTemplateId: expect.any(Array),
                reminders: expect.any(Array),
                tags: expect.any(Array),
            }),
        );
    });

    it("should return DoesNotExistError if project template id does not exist", async () => {
        const result = await createEventTemplateAction({
            name: "Event",
            offsetDays: 1,
            duration: 1,
            note: "Note",
            eventType: "task",
            autoReschedule: true,
            projectTemplateId: "syYiyRzWGk5KQ1mZ",
            reminders: [],
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
        const result = await createEventTemplateAction({
            name: "",
            offsetDays: 1,
            duration: 1,
            note: "Note",
            eventType: "task",
            autoReschedule: true,
            projectTemplateId: projectTemplateIdFormTest,
            reminders: [],
            tags: [],
        });

        expect(result).toEqualLeft(
            ValidationError({
                name: expect.any(Array),
            }),
        );
    });

    it("should create a event template successfully", async () => {
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
            tags: [],
        });
        expect(result).toBeRight();
    });
});
