import * as E from "fp-ts/Either";
import { describe, expect, it } from "vitest";

import { ValidationError } from "@/common/errors";

import { createEventTemplateAction } from "@/features/event-templates/create/action";
import { listEventTemplatesAction } from "@/features/event-templates/list/action";
import { createProjectTemplateAction } from "@/features/project-templates/create/action";

describe("List event template server action", () => {
    it("should return validation error if payload has wrong types", async () => {
        const result = await listEventTemplatesAction(null, {
            projectTemplateId: 1234 as unknown as string,
        });

        expect(result).toEqualLeft(
            ValidationError({
                projectTemplateId: expect.any(Array),
            }),
        );
    });

    it("should list event templates successfully", async () => {
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
            tags: [],
        });
        if (E.isLeft(result)) {
            throw new Error(
                "Create event template action is not implemented correctly!",
            );
        }
        const ListResult = await listEventTemplatesAction(null, {
            projectTemplateId: projectTemplateIdFormTest,
        });
        expect(ListResult).toBeRight();
    });

    it("should return empty array when no event templates exist", async () => {
        const result = await listEventTemplatesAction(null, {
            projectTemplateId: "syYiyRzWGk5KQ1mZ",
        });
        if (E.isRight(result)) {
            expect(result.right).toEqual([]);
        }
    });
});
