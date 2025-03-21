"use client";

import { Group, Skeleton, Stack, Text, useModalsStack } from "@mantine/core";

import { ProjectOverview, ProjectTemplate } from "@/common/data/domain";

import { CreateEventTemplateButton } from "./createEventButton";
import { CreateProjectButton } from "./createProjectButton";
import { EventsTable } from "./eventTable";

// import { ProjectsTable } from "./projectsTable";

export function TemplateDetailsSkeleton(): React.ReactNode {
    return (
        <Stack>
            <Skeleton width={512} height={24} />
            <Skeleton width={512} height={128} />
            <Skeleton width={512} height={24} />
            <Skeleton width={512} height={24} />
        </Stack>
    );
}

export function TemplateDetails<T extends string>({
    projectTemplate,
    // projects,
    modalStack,
}: {
    projectTemplate: ProjectTemplate;
    projects: ProjectOverview[];
    modalStack: ReturnType<
        typeof useModalsStack<"create-project" | "add-event" | T>
    >;
}): React.ReactNode {
    return (
        <Stack>
            <Text>
                <Text span fw={700}>
                    Event Name:{" "}
                </Text>
                {projectTemplate.name}
            </Text>
            <Text>
                <Text span fw={700}>
                    Description:{" "}
                </Text>
                {projectTemplate.description}
            </Text>
            <Text>
                <Text span fw={700}>
                    Created at:{" "}
                </Text>
                {projectTemplate.createdAt.toString()}
            </Text>
            <Text>
                <Text span fw={700}>
                    Updated at:{" "}
                </Text>
                {projectTemplate.updatedAt.toString()}
            </Text>
            <Stack>
                {/* <ProjectsTable entries={projects} /> */}
                <EventsTable />
                <Group justify="flex-end">
                    {/* <CreateProjectButton
                        projectTemplateId={projectTemplate.id}
                        modalStack={modalStack}
                    /> */}
                    <CreateEventTemplateButton
                        projectTemplateId={projectTemplate.id}
                        modalStack={modalStack}
                    />
                </Group>
            </Stack>
        </Stack>
    );
}
