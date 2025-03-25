import { createInstantiableProjectTemplate } from "@/tests/utils";
import * as E from "fp-ts/Either";
import { describe, expect, it } from "vitest";

import { createProjectTemplateAction } from "@/features/project-templates/create/action";
import { createProjectAction } from "@/features/projects/create/action";
import { listAllProjectsAction } from "@/features/projects/listAll/action";

describe("List All Project server action", () => {
    it("should list all project successfully", async () => {
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
        const duuplicaterResult = await createProjectAction({
            name: "New Project",
            description: "Description of a new project",
            startsAt: "2024-02-01",
            projectTemplateId: projectTemplate.id,
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
