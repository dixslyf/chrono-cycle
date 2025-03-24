"use client";

import {
    Badge,
    Box,
    Group,
    Skeleton,
    Stack,
    Text,
    useModalsStack,
} from "@mantine/core";
import { X } from "lucide-react";

import brownSkeletonClasses from "@/app/skeleton-brown-bg.module.css";
import { formatDate } from "@/app/utils/dates";

import { ProjectTemplate } from "@/common/data/domain";

import { DeleteProjectTemplateButton } from "./deleteProjectTemplateButton";
import { EventTemplatesTable } from "./eventTemplatesTable";

export function ProjectTemplateDetails<T extends string>({
    projectTemplate,
    modalStack,
    onClose,
    isLoading,
}: {
    projectTemplate?: ProjectTemplate | undefined;
    modalStack: ReturnType<
        typeof useModalsStack<
            "project-template-details" | "add-event" | "event-details" | T
        >
    >;
    onClose: () => void;
    isLoading?: boolean | undefined;
}): React.ReactNode {
    return (
        // This part will eventually change to form. Data will be the value for inputs
        <Group className="w-full h-full gap-0 items-stretch">
            {/* name & desc & table */}
            <Stack
                className="w-2/3 py-8 px-12 h-full overflow-y-auto"
                align="stretch"
                gap="xl"
            >
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
            {/* create & update timestamp & close button */}
            <Stack
                className="py-8 px-4 w-1/3 items-stretch bg-palette1"
                justify="space-between"
            >
                <Box>
                    <Stack>
                        <Group justify="flex-end">
                            <X
                                className="text-palette3 hover:text-gray-400 cursor-pointer w-8 h-8"
                                onClick={onClose}
                            />
                        </Group>
                        <Skeleton
                            visible={isLoading}
                            className={brownSkeletonClasses.root}
                        >
                            <Group>
                                <Text className="font-semibold text-xl text-palette3">
                                    Project Template ID
                                </Text>
                                <Badge className="bg-stone-500 bg-opacity-50 text-gray-300">
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
                </Box>
                <Group justify="flex-end">
                    <DeleteProjectTemplateButton
                        projectTemplateId={projectTemplate?.id ?? ""}
                        onSuccess={onClose}
                        disabled={isLoading}
                    />
                </Group>
            </Stack>
        </Group>
    );
}
