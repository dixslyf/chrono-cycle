"use client";

import {
    Badge,
    Group,
    Skeleton,
    Stack,
    Text,
    useModalsStack,
} from "@mantine/core";

import brownSkeletonClasses from "@/app/skeleton-brown-bg.module.css";
import { formatDate } from "@/app/utils/dates";

import { ProjectTemplate } from "@/common/data/domain";

import { DeleteProjectTemplateButton } from "./deleteProjectTemplateButton";
import { EventTemplatesTable } from "./eventTemplatesTable";
import { ExportProjectTemplateButton } from "./exportProjectTemplateButton";

export function ProjectTemplateDetailsLeft<T extends string>({
    projectTemplate,
    modalStack,
    isLoading,
}: {
    projectTemplate?: ProjectTemplate | undefined;
    modalStack: ReturnType<
        typeof useModalsStack<
            "project-template-details" | "add-event" | "event-details" | T
        >
    >;
    isLoading?: boolean | undefined;
}): React.ReactNode {
    return (
        // This part will eventually change to form. Data will be the value for inputs
        <Stack className="h-full overflow-y-auto" align="stretch" gap="xl">
            <Skeleton visible={isLoading}>
                <Text className="text-3xl font-bold h-1/8">
                    {projectTemplate?.name}
                </Text>
            </Skeleton>
            <Skeleton visible={isLoading}>
                <Stack className="h-1/4" align="stretch">
                    <Text className="text-palette5 font-semibold text-xl">
                        Description:
                    </Text>
                    <Text className="flex-1 border border-gray-400 rounded-xl p-4">
                        {projectTemplate?.description}
                    </Text>
                </Stack>
            </Skeleton>
            <Skeleton visible={isLoading}>
                <Stack className="flex-1">
                    <Text className="text-palette5 font-semibold text-xl">
                        Events:
                    </Text>
                    <EventTemplatesTable
                        projectTemplateId={projectTemplate?.id ?? ""}
                        eventTemplates={projectTemplate?.events ?? []}
                        modalStack={modalStack}
                    />
                </Stack>
            </Skeleton>
        </Stack>
    );
}

export function ProjectTemplateDetailsRight({
    projectTemplate,
    onDeleteSuccess,
    isLoading,
}: {
    projectTemplate?: ProjectTemplate | undefined;
    onDeleteSuccess: () => void;
    isLoading?: boolean | undefined;
}): React.ReactNode {
    return (
        <Stack h="100%" justify="space-between">
            <Stack>
                <Skeleton
                    visible={isLoading}
                    className={brownSkeletonClasses.root}
                >
                    <Group>
                        <Text className="font-semibold text-xl text-palette3">
                            Project Template ID:
                        </Text>
                        <Badge size="lg" color="brown">
                            {projectTemplate?.id}
                        </Badge>
                    </Group>
                </Skeleton>
                <Skeleton
                    visible={isLoading}
                    className={brownSkeletonClasses.root}
                >
                    <Group gap="md">
                        <Text className="text-palette3 font-semibold text-xl">
                            Created At:
                        </Text>
                        <Text className="text-lg font-medium text-gray-300">
                            {projectTemplate &&
                                formatDate(projectTemplate.createdAt, {
                                    withTime: true,
                                })}
                        </Text>
                    </Group>
                </Skeleton>
                <Skeleton
                    visible={isLoading}
                    className={brownSkeletonClasses.root}
                >
                    <Group>
                        <Text className="text-palette3 font-semibold text-xl">
                            Updated At:
                        </Text>
                        <Text className="text-lg font-medium text-gray-300">
                            {projectTemplate &&
                                formatDate(projectTemplate.updatedAt, {
                                    withTime: true,
                                })}
                        </Text>
                    </Group>
                </Skeleton>
            </Stack>
            <Group justify="flex-end">
                <ExportProjectTemplateButton
                    projectTemplate={projectTemplate}
                    disabled={isLoading}
                />
                <DeleteProjectTemplateButton
                    projectTemplateId={projectTemplate?.id ?? ""}
                    onSuccess={onDeleteSuccess}
                    disabled={isLoading}
                />
            </Group>
        </Stack>
    );
}
