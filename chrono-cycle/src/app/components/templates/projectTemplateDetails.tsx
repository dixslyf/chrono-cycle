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

import { formatDate } from "@/app/utils/dates";

import { ProjectTemplate } from "@/common/data/domain";

import { DeleteTemplateButton } from "./deleteTemplateButton";
import { EventTemplatesTable } from "./eventTemplatesTable";

export function ProjectTemplateDetailsSkeleton(): React.ReactNode {
    return (
        <Stack>
            <Skeleton width={512} height={24} />
            <Skeleton width={512} height={128} />
            <Skeleton width={512} height={24} />
            <Skeleton width={512} height={24} />
        </Stack>
    );
}

export function ProjectTemplateDetails<T extends string>({
    projectTemplate,
    modalStack,
    onClose,
}: {
    projectTemplate: ProjectTemplate;
    modalStack: ReturnType<
        typeof useModalsStack<
            | "project-template-details"
            | "create-project"
            | "add-event"
            | "event-details"
            | T
        >
    >;
    onClose: () => void;
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
                <Text className="text-3xl font-bold h-1/8">
                    {projectTemplate.name}
                </Text>
                <Stack className="h-1/4" align="stretch">
                    <Text className="text-palette5 font-semibold text-xl">
                        Description:
                    </Text>
                    <Text className="flex-1 border border-gray-400 rounded-xl p-4">
                        {projectTemplate.description}
                    </Text>
                </Stack>
                <Stack className="flex-1">
                    <Text className="text-palette5 font-semibold text-xl">
                        Events:
                    </Text>
                    <EventTemplatesTable
                        projectTemplateId={projectTemplate.id}
                        eventTemplates={projectTemplate.events}
                        modalStack={modalStack}
                    />
                </Stack>
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
                        <Group>
                            <Text className="font-semibold text-xl text-palette3">
                                Project Template ID
                            </Text>
                            <Badge className="bg-stone-500 bg-opacity-50 text-gray-300">
                                {projectTemplate.id}
                            </Badge>
                        </Group>
                        <Group gap="md">
                            <Text className="text-palette3 font-semibold text-xl">
                                Created At:
                            </Text>
                            <Text className="text-lg font-medium text-gray-300">
                                {formatDate(projectTemplate.createdAt, {
                                    withTime: true,
                                })}
                            </Text>
                        </Group>
                        <Group>
                            <Text className="text-palette3 font-semibold text-xl">
                                Updated At:
                            </Text>
                            <Text className="text-lg font-medium text-gray-300">
                                {formatDate(projectTemplate.updatedAt, {
                                    withTime: true,
                                })}
                            </Text>
                        </Group>
                    </Stack>
                </Box>
                <Group justify="flex-end">
                    <DeleteTemplateButton
                        projectTemplateId={projectTemplate.id}
                        onSuccess={onClose}
                    />
                </Group>
            </Stack>
        </Group>
    );
}
