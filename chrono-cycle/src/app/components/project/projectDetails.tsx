"use client";

import {
    Badge,
    Group,
    Skeleton,
    Stack,
    Text,
    useModalsStack,
} from "@mantine/core";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import React from "react";

import { formatDate } from "@/app/utils/dates";

import { Project, ProjectTemplate } from "@/common/data/domain";

import { DeleteProjectButton } from "./deleteProjectButton";

export function ProjectDetailsLeft({
    project,
    projectTemplate,
    isLoading,
}: {
    project: Project;
    projectTemplate?: O.Option<ProjectTemplate>;
    isLoading?: boolean;
}): React.ReactNode {
    return (
        <Stack className="h-full overflow-y-auto" align="stretch" gap="xl">
            {/* description */}
            <Skeleton visible={isLoading}>
                <Stack align="stretch">
                    <Text className="text-palette5 font-semibold text-xl">
                        Description
                    </Text>
                    <Text className="flex-1 border border-gray-400 rounded-xl p-4">
                        {project.description}
                    </Text>
                </Stack>
            </Skeleton>
            <Skeleton visible={isLoading}>
                <Stack>
                    <Text>Project Template:</Text>
                    <Text>
                        {pipe(
                            projectTemplate,
                            O.fromNullable,
                            O.flatten,
                            O.map((pt) => `${pt.name} (${pt.id})`),
                            O.getOrElse(() => "None"),
                        )}
                    </Text>
                </Stack>
            </Skeleton>
        </Stack>
    );
}

export function ProjectDetailsRight<T extends string>({
    project,
    modalStack,
    isLoading,
    onDeleteSuccess,
}: {
    project: Project;
    modalStack: ReturnType<typeof useModalsStack<"confirm-delete-project" | T>>;
    isLoading?: boolean;
    onDeleteSuccess: () => void;
}): React.ReactNode {
    return (
        <Stack h="100%" justify="space-between">
            <Stack>
                <Skeleton visible={isLoading}>
                    <Group>
                        <Text className="font-semibold text-xl text-palette3">
                            Project ID:
                        </Text>
                        <Badge size="lg" color="brown">
                            {project.id}
                        </Badge>
                    </Group>
                </Skeleton>
                <Skeleton visible={isLoading}>
                    <Group>
                        <Text className="text-palette3 font-semibold text-xl">
                            Starts At:
                        </Text>
                        <Text className="text-lg font-medium text-gray-300">
                            {formatDate(project.startsAt)}
                        </Text>
                    </Group>
                </Skeleton>
                <Skeleton visible={isLoading}>
                    <Group>
                        <Text className="text-palette3 font-semibold text-xl">
                            Created At:
                        </Text>
                        <Text className="text-lg font-medium text-gray-300">
                            {formatDate(project.createdAt, { withTime: true })}
                        </Text>
                    </Group>
                </Skeleton>
                <Skeleton visible={isLoading}>
                    <Group>
                        <Text className="text-palette3 font-semibold text-xl">
                            Updated At:
                        </Text>
                        <Text className="text-lg font-medium text-gray-300">
                            {formatDate(project.updatedAt, { withTime: true })}
                        </Text>
                    </Group>
                </Skeleton>
            </Stack>
            <Group justify="flex-end">
                <DeleteProjectButton
                    projectId={project.id}
                    modalStack={modalStack}
                    onSuccess={onDeleteSuccess}
                    disabled={isLoading}
                />
            </Group>
        </Stack>
    );
}
