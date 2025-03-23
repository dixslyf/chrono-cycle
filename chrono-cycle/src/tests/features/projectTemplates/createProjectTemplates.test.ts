import * as E from "fp-ts/Either";
import { revalidatePath } from "next/cache";
import { describe, expect, it } from "vitest";

import { DuplicateNameError, ValidationError } from "@/common/errors";

import { createProjectTemplateAction } from "@/features/project-templates/create/action";

describe("Create Project template server action", () => {
    it("should return validation error if payload has wrong types", async () => {
        const result = await createProjectTemplateAction(null, {
            name: 1234 as unknown as string,
            description: 5678 as unknown as string,
        });

        expect(result).toEqualLeft(
            ValidationError({
                name: expect.any(Array),
                description: expect.any(Array),
            }),
        );
    });

    it("should return validation error if project template name is empty", async () => {
        const result = await createProjectTemplateAction(null, {
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
        const result = await createProjectTemplateAction(null, {
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
        const duuplicaterResult = await createProjectTemplateAction(null, {
            name: "New Project Name",
            description: "Description of a new project",
        });
        expect(duuplicaterResult).toEqualLeft(DuplicateNameError());
    });

    it("should create a project template successfully", async () => {
        const result = await createProjectTemplateAction(null, {
            name: "New Project Name",
            description: "Description of a new project",
        });

        expect(result).toBeRight();
        expect(revalidatePath).toHaveBeenCalledWith("/templates");
    });
});
