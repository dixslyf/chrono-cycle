"use client";

import {
    Box,
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
import { useCallback, useState } from "react";

import { formatDate } from "@/app/utils/dates";
import { listProjectTemplatesOptions } from "@/app/utils/queries/listProjectTemplates";

import { ProjectTemplate } from "@/common/data/domain";

import { retrieveProjectTemplateAction } from "@/features/project-templates/retrieve/action";

import { SplitModal } from "../generic/splitModal";
import {
    ProjectTemplateDetailsLeft,
    ProjectTemplateDetailsRight,
} from "./projectTemplateDetails";

// TODO
// should put this somewhere else
interface ProjecTemplateRecord {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    updatedAt: string;
}

type Column = {
    accessor: keyof ProjecTemplateRecord;
    title: string;
};

const columns: Column[] = [
    { accessor: "name", title: "Name" },
    { accessor: "description", title: "Description" },
    { accessor: "createdAt", title: "Created at" },
    { accessor: "updatedAt", title: "Updated at" },
];

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
        "event-details",
    ]);

    const { close: modalStackClose } = modalStack;
    const closeModal = useCallback(
        () => modalStackClose("project-template-details"),
        [modalStackClose],
    );

    // State for storing the clicked project template.
    const [clickedId, setClickedId] = useState<string | null>(null);

    // Query for retrieving project template data.
    const retrieveQuery = useQuery({
        queryKey: ["retrieve-project-template", clickedId],
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
            onError: () => closeModal(),
        },
    });

    return (
        <>
            <Modal.Stack>
                {/* Modal window for showing the details of the clicked project template. */}
                <SplitModal
                    {...modalStack.register("project-template-details")}
                >
                    <SplitModal.Left>
                        <ProjectTemplateDetailsLeft
                            modalStack={modalStack}
                            projectTemplate={retrieveQuery.data}
                            isLoading={retrieveQuery.isPending}
                        />
                    </SplitModal.Left>
                    <SplitModal.Right>
                        <ProjectTemplateDetailsRight
                            projectTemplate={retrieveQuery.data}
                            onDeleteSuccess={closeModal}
                            isLoading={retrieveQuery.isPending}
                        />
                    </SplitModal.Right>
                </SplitModal>
            </Modal.Stack>
            {/* Project Template Table */}
            <ScrollArea className="h-[80%]">
                <Stack className="py-2 px-4">
                    {listPtsQuery.isPending ? (
                        <Loader size="md" />
                    ) : records.length === 0 ? (
                        <Text className="text-lg">No Project Templates</Text>
                    ) : (
                        <Stack>
                            {records.map((record) => (
                                <Box
                                    key={record.id}
                                    className="cursor-pointer border border-gray-200 rounded-xl p-4 hover:bg-gray-200 transition-colors duration-200"
                                    onClick={() => {
                                        modalStack.open(
                                            "project-template-details",
                                        );
                                        setClickedId(record.id);
                                    }}
                                >
                                    <Text className="text-xl font-semibold">
                                        {record.name}
                                    </Text>
                                </Box>
                            ))}
                        </Stack>
                    )}
                </Stack>
            </ScrollArea>
        </>
    );
}
