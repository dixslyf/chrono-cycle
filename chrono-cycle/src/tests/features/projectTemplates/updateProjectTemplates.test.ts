import * as E from "fp-ts/Either";
import { revalidatePath } from "next/cache";
import { describe, expect, it } from "vitest";

import {
    DoesNotExistError,
    DuplicateNameError,
    ValidationError,
} from "@/common/errors";

import { createProjectTemplateAction } from "@/features/project-templates/create/action";
import { updateProjectTemplateAction } from "@/features/project-templates/update/action";

describe("Update Project template server action", () => {
    it("should return validation error if payload has wrong types", async () => {
        const result = await updateProjectTemplateAction(null, {
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

    it("should return validation error if project template id is empty", async () => {
        const result = await updateProjectTemplateAction(null, {
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

    it("should return validation error if project template name is empty", async () => {
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
        const result = await updateProjectTemplateAction(null, {
            id: projectTemplateIdFormTest,
            name: "",
            description: "Description of a new project",
        });

        expect(result).toEqualLeft(
            ValidationError({
                name: expect.any(Array),
            }),
        );
    });

    it("should return validation error if project template description is empty", async () => {
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
        const result = await updateProjectTemplateAction(null, {
            id: projectTemplateIdFormTest,
            name: "New Project Name",
            description: "",
        });

        expect(result).toEqualLeft(
            ValidationError({
                description: expect.any(Array),
            }),
        );
    });

    it("should return DuplicateNameError if project template name already exists", async () => {
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
        const duuplicaterResult = await updateProjectTemplateAction(null, {
            id: projectTemplateIdFormTest,
            name: "New Project Name",
            description: "Description of a new project",
        });
        expect(duuplicaterResult).toEqualLeft(DuplicateNameError());
    });

    it("should return DoesNotExistError if project template does not exist", async () => {
        const result = await updateProjectTemplateAction(null, {
            id: "syYiyRzWGk5KQ1mZ",
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

        const result = await updateProjectTemplateAction(null, {
            id: projectTemplateIdFormTest,
            name: "Project",
            description: "Description of a new project",
        });

        expect(result).toBeRight();
        expect(revalidatePath).toHaveBeenCalledWith("/templates");
    });
});
