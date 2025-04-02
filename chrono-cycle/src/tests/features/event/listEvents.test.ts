import * as E from "fp-ts/Either";
import { describe, expect, it } from "vitest";

import { ValidationError } from "@/common/errors";

import { createEventTemplateAction } from "@/features/event-templates/create/action";
import { listEventsAction } from "@/features/events/list/action";
import { createProjectTemplateAction } from "@/features/project-templates/create/action";
import { createProjectAction } from "@/features/projects/create/action";

describe("List event template server action", () => {
    it("should return validation error if payload has wrong types", async () => {
        const result = await listEventsAction(null, {
            projectId: 1234 as unknown as string,
        });

        expect(result).toEqualLeft(
            ValidationError({
                projectId: expect.any(Array),
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
        const createProjectResult = await createProjectAction({
            name: "Test Project",
            description: "Test Description",
            startsAt: "2024-01-01",
            projectTemplateId: projectTemplate.id,
        });
        if (E.isLeft(createProjectResult)) {
            throw new Error(
                "Create project action is not implemented correctly!",
            );
        }
        const project = createProjectResult.right;
        const ListResult = await listEventsAction(null, {
            projectId: project.id,
        });
        expect(ListResult).toBeRight();
    });

    it("should return empty array when no events exist", async () => {
        const result = await listEventsAction(null, {
            projectId: "bUjPw9W3LsGJXZzU",
        });
        if (E.isRight(result)) {
            expect(result.right).toEqual([]);
        }
    });
});
