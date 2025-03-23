import * as E from "fp-ts/Either";
import { describe, expect, it } from "vitest";

import { DoesNotExistError, ValidationError } from "@/common/errors";

import { createProjectTemplateAction } from "@/features/project-templates/create/action";
import { retrieveProjectTemplateAction } from "@/features/project-templates/retrieve/action";

describe("Retrieve Project template server action", () => {
    it("should return validation error if payload has wrong types", async () => {
        const result = await retrieveProjectTemplateAction({
            projectTemplateId: 1234 as unknown as string,
        });

        expect(result).toEqualLeft(
            ValidationError({
                projectTemplateId: expect.any(Array),
            }),
        );
    });

    it("should return validation error if project template id is empty", async () => {
        const result = await retrieveProjectTemplateAction({
            projectTemplateId: "",
        });

        expect(result).toEqualLeft(
            ValidationError({
                projectTemplateId: expect.any(Array),
            }),
        );
    });

    it("should return DoesNotExistError if project template does not exist", async () => {
        const result = await retrieveProjectTemplateAction({
            projectTemplateId: "syYiyRzWGk5KQ1mZ",
        });
        expect(result).toEqualLeft(DoesNotExistError());
    });

    it("should retrieve a project template successfully", async () => {
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

        const result = await retrieveProjectTemplateAction({
            projectTemplateId: projectTemplateIdFormTest,
        });

        expect(result).toBeRight();
    });
});
