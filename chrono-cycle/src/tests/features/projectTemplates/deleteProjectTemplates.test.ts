import * as E from "fp-ts/Either";
import { revalidatePath } from "next/cache";
import { describe, expect, it, vi } from "vitest";

import { DoesNotExistError, ValidationError } from "@/common/errors";

import { createProjectTemplateAction } from "@/features/project-templates/create/action";
import { deleteProjectTemplateAction } from "@/features/project-templates/delete/action";

describe("Delete Project template server action", () => {
    it("should return validation error if payload has wrong types", async () => {
        const result = await deleteProjectTemplateAction(null, {
            projectTemplateId: 1234 as unknown as string,
        });

        expect(result).toEqualLeft(
            ValidationError({
                projectTemplateId: expect.any(Array),
            }),
        );
    });

    it("should return validation error if project template id is empty", async () => {
        const result = await deleteProjectTemplateAction(null, {
            projectTemplateId: "",
        });

        expect(result).toEqualLeft(
            ValidationError({
                projectTemplateId: expect.any(Array),
            }),
        );
    });

    it("should return DoesNotExistError if project template does not exist", async () => {
        const result = await deleteProjectTemplateAction(null, {
            projectTemplateId: "syYiyRzWGk5KQ1mZ",
        });
        expect(result).toEqualLeft(DoesNotExistError());
    });

    it("should delete a project template successfully", async () => {
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

        const result = await deleteProjectTemplateAction(null, {
            projectTemplateId: projectTemplateIdFormTest,
        });

        expect(result).toBeRight();
        expect(revalidatePath).toHaveBeenCalledWith("/templates");
    });
});
