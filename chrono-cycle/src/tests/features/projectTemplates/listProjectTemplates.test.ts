import * as E from "fp-ts/Either";
import { describe, expect, it } from "vitest";

import { createProjectTemplateAction } from "@/features/project-templates/create/action";
import { listProjectTemplatesAction } from "@/features/project-templates/list/action";

describe("List Project template server action", () => {
    it("should list project template successfully", async () => {
        const result = await createProjectTemplateAction({
            name: "New Project Name",
            description: "Description of a new project",
        });
        if (E.isLeft(result)) {
            throw new Error(
                "Create project template action is not implemented correctly!",
            );
        }
        const duplicatedResult = await createProjectTemplateAction({
            name: "Project",
            description: "Description of project",
        });
        if (E.isLeft(duplicatedResult)) {
            throw new Error(
                "Create project template action is not implemented correctly!",
            );
        }
        const ListResult = await listProjectTemplatesAction();
        expect(ListResult).toBeRight();
    });

    it("should return empty array when no projects exist", async () => {
        const result = await listProjectTemplatesAction();
        if (E.isRight(result)) {
            expect(result.right).toEqual([]);
        }
    });
});
