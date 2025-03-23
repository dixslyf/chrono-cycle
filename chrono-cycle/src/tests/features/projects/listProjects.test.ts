import * as E from "fp-ts/Either";
import { describe, expect, it, vi } from "vitest";

import { createProjectTemplateAction } from "@/features/project-templates/create/action";
import { listProjectsAction } from "@/features/projects/list/action";

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

describe("List Project server action", () => {
    it("should list project successfully", async () => {
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
        const ListResult = await listProjectsAction({
            projectTemplateId: projectTemplateIdFormTest,
        });
        expect(ListResult).toBeRight();
    });

    it("should return empty array when no projects exist", async () => {
        const result = await listProjectsAction({
            projectTemplateId: "syYiyRzWGk5KQ1mZ",
        });
        if (E.isRight(result)) {
            expect(result.right).toEqual([]);
        }
    });
});
