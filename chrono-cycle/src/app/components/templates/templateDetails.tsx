"use client";

import {
    Box,
    Group,
    Skeleton,
    Stack,
    Text,
    useModalsStack,
} from "@mantine/core";
import { X } from "lucide-react";

import { ProjectOverview, ProjectTemplate } from "@/common/data/domain";

import { CreateEventTemplateButton } from "./createEventButton";
import { DeleteTemplateButton } from "./deleteTemplateButton";
import { EventsTable } from "./eventTable";

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
    onClose,
}: {
    projectTemplate: ProjectTemplate;
    // projects: ProjectOverview[];
    modalStack: ReturnType<
        typeof useModalsStack<
            "project-template-details" | "create-project" | "add-event" | T
        >
    >;
    onClose: () => void;
}): React.ReactNode {
    return (
        <Group className="w-full h-full gap-0 items-stretch">
            {/* name & desc & table */}
            <Stack className="w-2/3 py-8 px-12 h-full overflow-y-auto" gap="xl">
                <Text className="text-3xl font-bold">
                    {projectTemplate.name}
                </Text>
                <Text className="h-64 border border-gray-400 rounded-xl p-4">
                    {projectTemplate.description}
                </Text>
                <EventsTable />
                <Group justify="flex-end">
                    <CreateEventTemplateButton
                        projectTemplateId={projectTemplate.id}
                        modalStack={modalStack}
                    />
                </Group>
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
                        <Group gap="md">
                            <Text className="text-palette3 font-semibold text-xl">
                                Created At:
                            </Text>
                            <Text className="text-lg font-medium text-gray-300">
                                {projectTemplate.createdAt.toString()}
                            </Text>
                        </Group>
                        <Group>
                            <Text className="text-palette3 font-semibold text-xl">
                                Updated At:
                            </Text>
                            <Text className="text-lg font-medium text-gray-300">
                                {projectTemplate.updatedAt.toString()}
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
