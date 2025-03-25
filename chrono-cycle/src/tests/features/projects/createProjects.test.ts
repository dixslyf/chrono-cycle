import {
    createInstantiableProjectTemplate,
    createNoninstantiableProjectTemplate,
} from "@/tests/utils";
import * as E from "fp-ts/Either";
import { revalidatePath } from "next/cache";
import { describe, expect, it } from "vitest";

import {
    DoesNotExistError,
    DuplicateNameError,
    NoEventTemplatesError,
    ValidationError,
} from "@/common/errors";

import { createProjectTemplateAction } from "@/features/project-templates/create/action";
import { createProjectAction } from "@/features/projects/create/action";

describe("Create Project server action", () => {
    it("should return validation error if payload has wrong types", async () => {
        const result = await createProjectAction({
            name: 1234 as unknown as string,
            description: 5678 as unknown as string,
            startsAt: 9876 as unknown as string,
            projectTemplateId: 1234 as unknown as string,
        });

        expect(result).toEqualLeft(
            ValidationError({
                name: expect.any(Array),
                description: expect.any(Array),
                startsAt: expect.any(Array),
                projectTemplateId: expect.any(Array),
            }),
        );
    });

    it("should return DoesNotExistError if project template does not exist", async () => {
        const result = await createProjectAction({
            name: "New Project Name",
            description: "Description",
            startsAt: "2024-01-01",
            projectTemplateId: "syYiyRzWGk5KQ1mZ",
        });
        expect(result).toEqualLeft(DoesNotExistError());
    });

    it("should return NoEventTemplatesError if project template does not have any event templates", async () => {
        const projectTemplate = await createNoninstantiableProjectTemplate();
        const result = await createProjectAction({
            name: "Test Project",
            description: "Test Description",
            startsAt: "2024-01-01",
            projectTemplateId: projectTemplate.id,
        });

        expect(result).toEqualLeft(NoEventTemplatesError());
    });

    it("should return validation error if project name is empty", async () => {
        const projectTemplate = await createInstantiableProjectTemplate();
        const result = await createProjectAction({
            name: "",
            description: "Description of a new project",
            startsAt: "2024-01-01",
            projectTemplateId: projectTemplate.id,
        });

        expect(result).toEqualLeft(
            ValidationError({
                name: expect.any(Array),
            }),
        );
    });

    it("should return validation error if project description is empty", async () => {
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
        const result = await createProjectAction({
            name: "Project Name",
            description: "",
            startsAt: "2024-01-01",
            projectTemplateId: projectTemplateIdFormTest,
        });

        expect(result).toEqualLeft(
            ValidationError({
                description: expect.any(Array),
            }),
        );
    });

    it("should return validation error if project start date is empty", async () => {
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
        const result = await createProjectAction({
            name: "Project Name",
            description: "Description of a new project",
            startsAt: "",
            projectTemplateId: projectTemplateIdFormTest,
        });

        expect(result).toEqualLeft(
            ValidationError({
                startsAt: expect.any(Array),
            }),
        );
    });

    it("should return DuplicateNameError if project name already exists", async () => {
        const projectTemplate = await createInstantiableProjectTemplate();

        const result = await createProjectAction({
            name: "New Project Name",
            description: "Description of a new project",
            startsAt: "2024-01-01",
            projectTemplateId: projectTemplate.id,
        });
        if (E.isLeft(result)) {
            throw new Error(
                "Create project action is not implemented correctly!",
            );
        }
        const duuplicateResult = await createProjectAction({
            name: "New Project Name",
            description: "Description of a new project",
            startsAt: "2024-01-01",
            projectTemplateId: projectTemplate.id,
        });
        expect(duuplicateResult).toEqualLeft(DuplicateNameError());
    });

    it("should create a project successfully", async () => {
        const projectTemplate = await createInstantiableProjectTemplate();

        const result = await createProjectAction({
            name: "Test Project",
            description: "Test Description",
            startsAt: "2024-01-01",
            projectTemplateId: projectTemplate.id,
        });

        expect(result).toBeRight();
        expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
    });
});
