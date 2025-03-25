import { createInstantiableProjectTemplate } from "@/tests/utils";
import * as E from "fp-ts/Either";
import { revalidatePath } from "next/cache";
import { describe, expect, it } from "vitest";

import { DoesNotExistError, ValidationError } from "@/common/errors";

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
        const project = result.right;
        const projectIdFormTest = project.id;
        const deleteResult = await deleteProjectAction(null, {
            projectId: projectIdFormTest,
        });

        expect(deleteResult).toBeRight();
        expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
    });
});
