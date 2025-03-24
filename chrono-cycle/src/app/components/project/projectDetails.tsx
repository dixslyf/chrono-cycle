"use client";

import { Stack, Text } from "@mantine/core";

import { formatDate } from "@/app/utils/dates";

import { Project } from "@/common/data/domain";

interface ProjectDetailsProps {
    project: Project;
}

function ProjectDetails({ project }: ProjectDetailsProps) {
    return (
        <Stack>
            <Text>ID: {project.id}</Text>
            <Text>Name: {project.name}</Text>
            <Text>Description: {project.description}</Text>
            <Text>Starts at: {formatDate(project.startsAt)}</Text>
            <Text>
                Created at: {formatDate(project.createdAt, { withTime: true })}
            </Text>
            <Text>
                Updated at: {formatDate(project.updatedAt, { withTime: true })}
            </Text>
            <Text>Project template ID: {project.projectTemplateId}</Text>
        </Stack>
    );
}

export default ProjectDetails;
