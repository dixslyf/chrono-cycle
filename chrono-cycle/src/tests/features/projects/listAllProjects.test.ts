import * as E from "fp-ts/Either";
import { revalidatePath } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createProjectTemplateAction } from "@/features/project-templates/create/action";
import { createProjectAction } from "@/features/projects/create/action";
import { listAllProjectsAction } from "@/features/projects/listAll/action";

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

describe("List All Project server action", () => {
    it("should list all project successfully", async () => {
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
        const duuplicaterResult = await createProjectAction({
            name: "New Project",
            description: "Description of a new project",
            startsAt: "2024-02-01",
            projectTemplateId: projectTemplateIdFormTest,
        });
        if (E.isLeft(duuplicaterResult)) {
            throw new Error(
                "Create project action is not implemented correctly!",
            );
        }
        const ListResult = await listAllProjectsAction();
        expect(ListResult).toBeRight();
    });

    it("should return empty array when no projects exist", async () => {
        const result = await listAllProjectsAction();
        if (E.isRight(result)) {
            expect(result.right).toEqual([]);
        }
    });
});
