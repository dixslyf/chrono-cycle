"use client";

import { useEffect, useState } from "react";
import { Text, Skeleton, Stack } from "@mantine/core";

import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

import {
    ProjectTemplateData,
    RetrieveError,
} from "@/server/project-templates/retrieve/data";
import { retrieveProjectTemplateAction } from "@/server/project-templates/retrieve/action";

function TemplateDetailsContent({
    templateData,
}: {
    templateData: ProjectTemplateData;
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

function TemplateDetailsContentSkeleton(): React.ReactNode {
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
    projectTemplateId,
    onRetrieveFail,
}: {
    projectTemplateId: string;
    onRetrieveFail: (err: RetrieveError) => void;
}): React.ReactNode {
    const [data, setData] = useState<ProjectTemplateData | null>(null);

    // Load the data.
    useEffect(() => {
        async function retrieveData() {
            const result =
                await retrieveProjectTemplateAction(projectTemplateId);

            pipe(
                result,
                E.match(
                    (err) => {
                        /* TODO: display errors */
                        onRetrieveFail(err);
                    },
                    (data) => setData(data),
                ),
            );
        }

        retrieveData();
    }, [projectTemplateId, onRetrieveFail]);

    return data ? (
        <TemplateDetailsContent templateData={data} />
    ) : (
        <TemplateDetailsContentSkeleton />
    );
}
