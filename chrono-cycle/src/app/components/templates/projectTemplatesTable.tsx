"use client";

import {
    Group,
    Loader,
    Modal,
    ScrollArea,
    Stack,
    Text,
    useModalsStack,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { useState } from "react";

import { queryKeys } from "@/app/utils/queries/keys";
import { listProjectTemplatesOptions } from "@/app/utils/queries/listProjectTemplates";

import { ProjectTemplate } from "@/common/data/domain";
import { formatDate } from "@/common/dates";

import { retrieveProjectTemplateAction } from "@/features/project-templates/retrieve/action";

import { ProjectTemplateDetailsModal } from "./projectTemplateDetails";

export function ProjectTemplatesTable(): React.ReactNode {
    const listPtsQuery = useQuery(listProjectTemplatesOptions());

    // Entries for the table.
    const records = listPtsQuery.data
        ? listPtsQuery.data.map(
              ({ id, name, description, createdAt, updatedAt }) => ({
                  id,
                  name,
                  description,
                  createdAt: formatDate(createdAt),
                  updatedAt: formatDate(updatedAt),
              }),
          )
        : [];

    // For keeping track of modals.
    const modalStack = useModalsStack([
        "project-template-details",
        "add-event",
        "event-template-details",
        "confirm-delete-event-template",
        "confirm-delete-project-template",
    ]);

    // State for storing the clicked project template.
    const [clickedId, setClickedId] = useState<string | null>(null);

    // Query for retrieving project template data.
    const retrieveQuery = useQuery({
        queryKey: queryKeys.projectTemplates.retrieve(clickedId),
        queryFn: async (): Promise<ProjectTemplate> => {
            // Safety: This query is only called when clicked ID is set.
            const projectTemplateId = clickedId as string;

            // Retrieve the project template data.
            const result = await retrieveProjectTemplateAction({
                projectTemplateId,
            });

            return pipe(
                result,
                E.getOrElseW((err) => {
                    // To trigger error notification from Tanstack query.
                    throw err;
                }),
            );
        },
        enabled: Boolean(clickedId),
        meta: {
            errorMessage: "Failed to retrieve project template data.",
            onError: () => modalStack.close("project-template-details"),
        },
    });

    return (
        <>
            <Modal.Stack>
                {/* Modal window for showing the details of the clicked project template. */}
                <ProjectTemplateDetailsModal
                    modalStack={modalStack}
                    projectTemplate={retrieveQuery.data}
                    isLoading={retrieveQuery.isPending}
                />
            </Modal.Stack>
            {/* Project Template Table */}
            <ScrollArea className="h-[80%] w-full">
                <Group>
                    <Stack className="w-full">
                        {listPtsQuery.isPending ? (
                            <Loader size="md" />
                        ) : records.length === 0 ? (
                            <Text className="text-lg">
                                No Project Templates
                            </Text>
                        ) : (
                            <Stack>
                                {records.map((record) => (
                                    <Group
                                        key={record.id}
                                        className="cursor-pointer border border-gray-300 rounded-xl p-4 hover:bg-gray-200 transition-colors duration-200 ease-in"
                                        onClick={() => {
                                            modalStack.open(
                                                "project-template-details",
                                            );
                                            setClickedId(record.id);
                                        }}
                                    >
                                        <Text className="text-xl font-semibold text-palette5">
                                            {record.name}
                                        </Text>
                                    </Group>
                                ))}
                            </Stack>
                        )}
                    </Stack>
                </Group>
            </ScrollArea>
        </>
    );
}
