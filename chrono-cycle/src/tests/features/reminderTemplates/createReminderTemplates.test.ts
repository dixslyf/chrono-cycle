import * as E from "fp-ts/Either";
import { describe, expect, it } from "vitest";

import {
    DoesNotExistError,
    DuplicateReminderError,
    ValidationError,
} from "@/common/errors";

import { createEventTemplateAction } from "@/features/event-templates/create/action";
import { createProjectTemplateAction } from "@/features/project-templates/create/action";
import { createReminderTemplateAction } from "@/features/reminder-templates/create/action";

describe("Create event template server action", () => {
    it("should return validation error if payload has wrong types", async () => {
        const result = await createReminderTemplateAction(null, {
            eventTemplateId: 1234 as unknown as string,
            daysBeforeEvent: "hello" as unknown as number,
            time: 1234 as unknown as string,
            emailNotifications: 3456 as unknown as boolean,
            desktopNotifications: 6789 as unknown as boolean,
        });

        expect(result).toEqualLeft(
            ValidationError({
                eventTemplateId: expect.any(Array),
                daysBeforeEvent: expect.any(Array),
                time: expect.any(Array),
                emailNotifications: expect.any(Array),
                desktopNotifications: expect.any(Array),
            }),
        );
    });

    it("should create a reminder template successfully", async () => {
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
        expect(result).toBeRight();
    });
});
