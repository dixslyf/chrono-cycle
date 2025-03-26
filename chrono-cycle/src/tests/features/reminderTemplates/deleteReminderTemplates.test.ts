import * as E from "fp-ts/Either";
import { describe, expect, it } from "vitest";

import { DoesNotExistError, ValidationError } from "@/common/errors";

import { createEventTemplateAction } from "@/features/event-templates/create/action";
import { createProjectTemplateAction } from "@/features/project-templates/create/action";
import { createReminderTemplateAction } from "@/features/reminder-templates/create/action";
import { deleteReminderTemplatesAction } from "@/features/reminder-templates/delete/action";

describe("Delete reminder template server action", () => {
    it("should return validation error if payload has wrong types", async () => {
        const result = await deleteReminderTemplatesAction(null, {
            reminderTemplateIds: 1234 as unknown as string[],
        });

        expect(result).toEqualLeft(
            ValidationError({
                reminderTemplateIds: expect.any(Array),
            }),
        );
    });

    it("should return validation error if event template id is empty", async () => {
        const result = await deleteReminderTemplatesAction(null, {
            reminderTemplateIds: [],
        });

        if (E.isRight(result)) {
            expect(result.right).toEqual(undefined);
        }
    });

    it("should delete a reminder template successfully", async () => {
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
        const result = await createReminderTemplateAction(null, {
            eventTemplateId: eventTemplateIdFormTest,
            daysBeforeEvent: 1,
            time: "09:00:00+00",
            emailNotifications: false,
            desktopNotifications: false,
        });
        if (E.isLeft(result)) {
            throw new Error(
                "Create reminder template action is not implemented correctly!",
            );
        }
        const reminderTemplate = result.right;
        const reminderTemplateIdFormTest = reminderTemplate.id;
        const deleteResult = await deleteReminderTemplatesAction(null, {
            reminderTemplateIds: [reminderTemplateIdFormTest],
        });
        expect(deleteResult).toBeRight();
    });
});
