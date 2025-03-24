"use client";

import { Skeleton, Stack, Text } from "@mantine/core";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";

import { formatDate } from "@/app/utils/dates";

import { Project, ProjectTemplate } from "@/common/data/domain";

interface ProjectDetailsProps {
    project: Project;
    projectTemplate?: O.Option<ProjectTemplate> | undefined;
    isLoading?: boolean | undefined;
}

function ProjectDetails({
    project,
    projectTemplate,
    isLoading,
}: ProjectDetailsProps) {
    return (
        <Stack>
            <Skeleton visible={isLoading}>
                <Text>ID: {project.id}</Text>
            </Skeleton>
            <Skeleton visible={isLoading}>
                <Text>Name: {project.name}</Text>
            </Skeleton>
            <Skeleton visible={isLoading}>
                <Text>Description: {project.description}</Text>
            </Skeleton>
            <Skeleton visible={isLoading}>
                <Text>Starts at: {formatDate(project.startsAt)}</Text>
            </Skeleton>
            <Skeleton visible={isLoading}>
                <Text>
                    Created at:{" "}
                    {formatDate(project.createdAt, { withTime: true })}
                </Text>
            </Skeleton>
            <Skeleton visible={isLoading}>
                <Text>
                    Updated at:{" "}
                    {formatDate(project.updatedAt, { withTime: true })}
                </Text>
            </Skeleton>
            <Skeleton visible={isLoading}>
                <Text>
                    Project template:{" "}
                    {pipe(
                        projectTemplate,
                        O.fromNullable,
                        O.flatten,
                        O.map((pt) => `${pt.name} (${pt.id})`),
                        O.getOrElse(() => "None"),
                    )}
                </Text>
            </Skeleton>
        </Stack>
    );
}

export default ProjectDetails;
