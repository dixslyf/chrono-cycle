import * as E from "fp-ts/Either";
import { revalidatePath } from "next/cache";
import { describe, expect, it } from "vitest";

import {
    DoesNotExistError,
    DuplicateNameError,
    ValidationError,
} from "@/common/errors";

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

    // it("should return DuplicateNameError if event template name already exists", async () => {
    //     const createProjectTemplateResult = await createProjectTemplateAction(
    //         {
    //             name: "New Project Name",
    //             description: "Description of a new project",
    //         },
    //     );
    //     if (E.isLeft(createProjectTemplateResult)) {
    //         throw new Error(
    //             "Create project template action is not implemented correctly!",
    //         );
    //     }
    //     const projectTemplate = createProjectTemplateResult.right;
    //     const projectTemplateIdFormTest = projectTemplate.id;
    //     const createEventTemplateResult = await createEventTemplateAction({
    //         name: "Event",
    //         offsetDays: 1,
    //         duration: 1,
    //         note: "Note",
    //         eventType: "task",
    //         autoReschedule: true,
    //         projectTemplateId: projectTemplateIdFormTest,
    //         reminders: [],
    //         tags: [],
    //     });
    //     if (E.isLeft(createEventTemplateResult)) {
    //         throw new Error(
    //             "Create event template action is not implemented correctly!",
    //         );
    //     }
    //     const eventTemplate = createEventTemplateResult.right;
    //     const eventTemplateIdFormTest = eventTemplate.id;
    //     const result = await updateEventTemplateAction(null, {
    //         id: eventTemplateIdFormTest,
    //         name: "Event",
    //         offsetDays: 1,
    //         duration: 1,
    //         note: "Note",
    //         autoReschedule: true,
    //         remindersDelete: [],
    //         remindersInsert: [],
    //         remindersUpdate: [],
    //         tags: [],
    //     });
    //     expect(result).toEqualLeft(
    //         ValidationError({
    //             name: expect.any(Array),
    //         }),
    //     );
    //     expect(result).toEqualLeft(DuplicateNameError());
    // });

    it("should update an event template successfully", async () => {
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
            tags: [],
        });
        expect(result).toBeRight();
        expect(revalidatePath).toHaveBeenCalledWith("/templates");
    });
});
