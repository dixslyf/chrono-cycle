import * as E from "fp-ts/Either";
import { revalidatePath } from "next/cache";
import { describe, expect, it } from "vitest";

import { DoesNotExistError, ValidationError } from "@/common/errors";

import { createProjectTemplateAction } from "@/features/project-templates/create/action";
import { createProjectAction } from "@/features/projects/create/action";
import { deleteProjectAction } from "@/features/projects/delete/action";

describe("Delete Project server action", () => {
    it("should return validation error if payload has wrong types", async () => {
        const result = await deleteProjectAction(null, {
            projectId: 1234 as unknown as string,
        });

        expect(result).toEqualLeft(
            ValidationError({
                projectId: expect.any(Array),
            }),
        );
    });

    it("should return validation error if project id is empty", async () => {
        const result = await deleteProjectAction(null, {
            projectId: "",
        });

        expect(result).toEqualLeft(
            ValidationError({
                projectId: expect.any(Array),
            }),
        );
    });

    it("should return DoesNotExistError if project does not exist", async () => {
        const result = await deleteProjectAction(null, {
            projectId: "bUjPw9W3LsGJXZzU",
        });
        expect(result).toEqualLeft(DoesNotExistError());
    });

    it("should delete a project successfully", async () => {
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
            name: "New Project Name",
            description: "Description of a new project",
            startsAt: "2024-01-01",
            projectTemplateId: projectTemplateIdFormTest,
        });
        if (E.isLeft(result)) {
            throw new Error(
                "Create project action is not implemented correctly!",
            );
        }
        const project = result.right;
        const projectIdFormTest = project.id;
        const deleteResult = await deleteProjectAction(null, {
            projectId: projectIdFormTest,
        });

        expect(deleteResult).toBeRight();
        expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
    });
});
