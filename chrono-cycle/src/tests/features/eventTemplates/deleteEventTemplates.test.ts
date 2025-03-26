import * as E from "fp-ts/Either";
import { describe, expect, it } from "vitest";

import { DoesNotExistError, ValidationError } from "@/common/errors";

import { createEventTemplateAction } from "@/features/event-templates/create/action";
import { deleteEventTemplatesAction } from "@/features/event-templates/delete/action";
import { createProjectTemplateAction } from "@/features/project-templates/create/action";

describe("Delete event template server action", () => {
    it("should return validation error if payload has wrong types", async () => {
        const result = await deleteEventTemplatesAction({
            eventTemplateIds: 1234 as unknown as string[],
        });

        expect(result).toEqualLeft(
            ValidationError({
                eventTemplateIds: expect.any(Array),
            }),
        );
    });

    it("should return validation error if event template id is empty", async () => {
        const result = await deleteEventTemplatesAction({
            eventTemplateIds: [],
        });

        if (E.isRight(result)) {
            expect(result.right).toEqual(undefined);
        }
    });

    it("should return DoesNotExistError if event template does not exist", async () => {
        const result = await deleteEventTemplatesAction({
            eventTemplateIds: ["hXAOb0o7SCxM6yVp"],
        });
        expect(result).toEqualLeft(DoesNotExistError());
    });

    it("should delete an event template successfully", async () => {
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
        const eventTemplate = result.right;
        const eventTemplateIdFormTest = eventTemplate.id;
        const deleteResult = await deleteEventTemplatesAction({
            eventTemplateIds: [eventTemplateIdFormTest],
        });
        expect(deleteResult).toBeRight();
    });
});
