import { createInstantiableProjectTemplate } from "@/tests/utils";
import * as E from "fp-ts/Either";
import { describe, expect, it } from "vitest";

import { DoesNotExistError, ValidationError } from "@/common/errors";

import { createProjectTemplateAction } from "@/features/project-templates/create/action";
import { createProjectAction } from "@/features/projects/create/action";
import { retrieveProjectAction } from "@/features/projects/retrieve/action";

describe("Retrieve Project server action", () => {
    it("should return validation error if payload has wrong types", async () => {
        const result = await retrieveProjectAction({
            projectId: 1234 as unknown as string,
        });

        expect(result).toEqualLeft(
            ValidationError({
                projectId: expect.any(Array),
            }),
        );
    });

    it("should return validation error if project id is empty", async () => {
        const result = await retrieveProjectAction({
            projectId: "",
        });

        expect(result).toEqualLeft(
            ValidationError({
                projectId: expect.any(Array),
            }),
        );
    });

    it("should return DoesNotExistError if project does not exist", async () => {
        const result = await retrieveProjectAction({
            projectId: "bUjPw9W3LsGJXZzU",
        });
        expect(result).toEqualLeft(DoesNotExistError());
    });

    it("should retrieve a project successfully", async () => {
        const projectTemplate = await createInstantiableProjectTemplate();
        const createProjectResult = await createProjectAction({
            name: "Test Project",
            description: "Test Description",
            startsAt: "2024-01-01",
            projectTemplateId: projectTemplate.id,
        });
        if (E.isLeft(createProjectResult)) {
            throw new Error(
                "Create project action is not implemented correctly!",
            );
        }
        const project = createProjectResult.right;
        const projectIdFormTest = project.id;

        const result = await retrieveProjectAction({
            projectId: projectIdFormTest,
        });

        expect(result).toBeRight();
    });
});
