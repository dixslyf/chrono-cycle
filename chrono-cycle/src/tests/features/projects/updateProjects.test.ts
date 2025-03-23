import * as E from "fp-ts/Either";
import { revalidatePath } from "next/cache";
import { describe, expect, it } from "vitest";

import {
    DoesNotExistError,
    DuplicateNameError,
    ValidationError,
} from "@/common/errors";

import { createProjectTemplateAction } from "@/features/project-templates/create/action";
import { createProjectAction } from "@/features/projects/create/action";
import { updateProjectAction } from "@/features/projects/update/action";

describe("Update Project server action", () => {
    it("should return validation error if payload has wrong types", async () => {
        const result = await updateProjectAction(null, {
            id: 1234 as unknown as string,
            name: 5678 as unknown as string,
            description: 9876 as unknown as string,
        });

        expect(result).toEqualLeft(
            ValidationError({
                id: expect.any(Array),
                name: expect.any(Array),
                description: expect.any(Array),
            }),
        );
    });

    it("should return validation error if project id is empty", async () => {
        const result = await updateProjectAction(null, {
            id: "",
            name: "New Project Name",
            description: "Description of a new project",
        });

        expect(result).toEqualLeft(
            ValidationError({
                id: expect.any(Array),
            }),
        );
    });

    it("should return validation error if project name is empty", async () => {
        const createProjectTemplateResult = await createProjectTemplateAction(
            null,
            {
                name: "New Project Name",
                description: "Description of a new project",
            },
        );
        if (E.isLeft(createProjectTemplateResult)) {
            throw new Error(
                "Create project template action is not implemented correctly!",
            );
        }
        const projectTemplate = createProjectTemplateResult.right;
        const projectTemplateIdFormTest = projectTemplate.id;
        const createProjectResult = await createProjectAction({
            name: "Test Project",
            description: "Test Description",
            startsAt: "2024-01-01",
            projectTemplateId: projectTemplateIdFormTest,
        });
        if (E.isLeft(createProjectResult)) {
            throw new Error(
                "Create project action is not implemented correctly!",
            );
        }
        const project = createProjectResult.right;
        const projectIdFormTest = project.id;
        const result = await updateProjectAction(null, {
            id: projectIdFormTest,
            name: "",
            description: "Description of a new project",
        });

        expect(result).toEqualLeft(
            ValidationError({
                name: expect.any(Array),
            }),
        );
    });

    it("should return validation error if project description is empty", async () => {
        const createProjectTemplateResult = await createProjectTemplateAction(
            null,
            {
                name: "New Project Name",
                description: "Description of a new project",
            },
        );
        if (E.isLeft(createProjectTemplateResult)) {
            throw new Error(
                "Create project template action is not implemented correctly!",
            );
        }
        const projectTemplate = createProjectTemplateResult.right;
        const projectTemplateIdFormTest = projectTemplate.id;
        const createProjectResult = await createProjectAction({
            name: "Test Project",
            description: "Test Description",
            startsAt: "2024-01-01",
            projectTemplateId: projectTemplateIdFormTest,
        });
        if (E.isLeft(createProjectResult)) {
            throw new Error(
                "Create project action is not implemented correctly!",
            );
        }
        const project = createProjectResult.right;
        const projectIdFormTest = project.id;
        const result = await updateProjectAction(null, {
            id: projectIdFormTest,
            name: "New Project Name",
            description: "",
        });

        expect(result).toEqualLeft(
            ValidationError({
                description: expect.any(Array),
            }),
        );
    });

    it("should return DuplicateNameError if project name already exists", async () => {
        const result = await createProjectTemplateAction(null, {
            name: "New Project Name",
            description: "Description of a new project",
        });
        if (E.isLeft(result)) {
            throw new Error(
                "Create project template action is not implemented correctly!",
            );
        }
        const projectTemplate = result.right;
        const projectTemplateIdFormTest = projectTemplate.id;
        const createProjectResult = await createProjectAction({
            name: "New Project Name",
            description: "Test Description",
            startsAt: "2024-01-01",
            projectTemplateId: projectTemplateIdFormTest,
        });
        if (E.isLeft(createProjectResult)) {
            throw new Error(
                "Create project action is not implemented correctly!",
            );
        }
        const project = createProjectResult.right;
        const projectIdFormTest = project.id;
        const duuplicaterResult = await updateProjectAction(null, {
            id: projectIdFormTest,
            name: "New Project Name",
            description: "Description of a new project",
        });
        expect(duuplicaterResult).toEqualLeft(DuplicateNameError());
    });

    it("should return DoesNotExistError if project does not exist", async () => {
        const result = await updateProjectAction(null, {
            id: "bUjPw9W3LsGJXZzU",
            name: "New Project Name",
            description: "Description",
        });
        expect(result).toEqualLeft(DoesNotExistError());
    });

    it("should update a project template successfully", async () => {
        const createProjectTemplateResult = await createProjectTemplateAction(
            null,
            {
                name: "New Project Name",
                description: "Description of a new project",
            },
        );
        if (E.isLeft(createProjectTemplateResult)) {
            throw new Error(
                "Create project template action is not implemented correctly!",
            );
        }
        const projectTemplate = createProjectTemplateResult.right;
        const projectTemplateIdFormTest = projectTemplate.id;
        const createProjectResult = await createProjectAction({
            name: "Test Project",
            description: "Test Description",
            startsAt: "2024-01-01",
            projectTemplateId: projectTemplateIdFormTest,
        });
        if (E.isLeft(createProjectResult)) {
            throw new Error(
                "Create project action is not implemented correctly!",
            );
        }
        const project = createProjectResult.right;
        const projectIdFormTest = project.id;
        const result = await updateProjectAction(null, {
            id: projectIdFormTest,
            name: "Project",
            description: "Description of a new project",
        });

        expect(result).toBeRight();
        expect(revalidatePath).toHaveBeenCalledWith("/templates");
    });
});
