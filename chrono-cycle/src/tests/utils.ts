import * as E from "fp-ts/Either";

import { ProjectTemplateOverview } from "@/common/data/domain";

import { createEventTemplateAction } from "@/features/event-templates/create/action";
import { createProjectTemplateAction } from "@/features/project-templates/create/action";

export async function createInstantiableProjectTemplate(): Promise<ProjectTemplateOverview> {
    const createProjectTemplateResult = await createProjectTemplateAction({
        name: "Instantiable Project Name",
        description: "Description of a new project",
    });
    if (E.isLeft(createProjectTemplateResult)) {
        throw new Error(
            "Create project template action is not implemented correctly!",
        );
    }

    const projectTemplate = createProjectTemplateResult.right;
    const createEventTemplateResult = await createEventTemplateAction({
        name: "New Event",
        offsetDays: 0,
        duration: 1,
        note: "",
        eventType: "task",
        autoReschedule: true,
        projectTemplateId: projectTemplate.id,
        reminders: [],
        tags: [],
    });
    if (E.isLeft(createEventTemplateResult)) {
        throw new Error(
            "Create event template action is not implemented correctly!",
        );
    }

    return projectTemplate;
}

export async function createNoninstantiableProjectTemplate(): Promise<ProjectTemplateOverview> {
    const createProjectTemplateResult = await createProjectTemplateAction({
        name: "Noninstantiable Project Name",
        description: "Description of a new project",
    });
    if (E.isLeft(createProjectTemplateResult)) {
        throw new Error(
            "Create project template action is not implemented correctly!",
        );
    }

    const projectTemplate = createProjectTemplateResult.right;
    return projectTemplate;
}
