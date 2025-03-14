"use client";

import { Skeleton, Stack, Text } from "@mantine/core";

import { ProjectTemplate } from "@/common/data/domain";

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

export function TemplateDetails({
    projectTemplateData: templateData,
}: {
    projectTemplateData: ProjectTemplate;
}): React.ReactNode {
    return (
        <Stack>
            <Text>
                <Text span fw={700}>
                    Event Name:{" "}
                </Text>
                {templateData.name}
            </Text>
            <Text>
                <Text span fw={700}>
                    Description:{" "}
                </Text>
                {templateData.description}
            </Text>
            <Text>
                <Text span fw={700}>
                    Created at:{" "}
                </Text>
                {templateData.createdAt.toString()}
            </Text>
            <Text>
                <Text span fw={700}>
                    Updated at:{" "}
                </Text>
                {templateData.updatedAt.toString()}
            </Text>
        </Stack>
    );
}
