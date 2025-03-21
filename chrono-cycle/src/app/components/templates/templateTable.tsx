"use client";

import { Modal, Stack, useModalsStack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { sequenceT } from "fp-ts/Apply";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { DataTable } from "mantine-datatable";
import { useCallback, useState } from "react";

import {
    ProjectOverview,
    ProjectTemplate,
    ProjectTemplateOverview,
} from "@/common/data/domain";

import { retrieveProjectTemplateAction } from "@/features/project-templates/retrieve/action";
import { listProjectsAction } from "@/features/projects/list/action";

import { TemplateDetails, TemplateDetailsSkeleton } from "./templateDetails";

const columns = [
    { accessor: "name", title: "Name" },
    { accessor: "description", title: "Description" },
    { accessor: "createdAt", title: "Created at" },
    { accessor: "updatedAt", title: "Updated at" },
];

type ClickedData = {
    projectTemplate: ProjectTemplate;
    projects: ProjectOverview[];
};

export function TemplateTable({
    entries,
}: {
    entries: ProjectTemplateOverview[];
}): React.ReactNode {
    // Entries for the table.
    const records = entries.map(
        ({ id, name, description, createdAt, updatedAt }) => ({
            id,
            name,
            description,
            createdAt: createdAt.toString(),
            updatedAt: updatedAt.toString(),
        }),
    );

    // For keeping track of modals.
    const modalStack = useModalsStack([
        "project-template-details",
        "add-event",
        "create-project",
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
        queryKey: ["retrieve-project-template-data", clickedId],
        queryFn: async (): Promise<ClickedData> => {
            // Safety: This query is only called when clicked ID is set.
            const projectTemplateId = clickedId as string;

            // Retrieve the template data and its projects.
            const [ptResult, projectsResult] = await Promise.all([
                retrieveProjectTemplateAction({ projectTemplateId }),
                listProjectsAction({ projectTemplateId }),
            ]);

            return pipe(
                sequenceT(E.Apply)(ptResult, projectsResult),
                E.match(
                    (err) => {
                        // To trigger error notification from Tanstack query.
                        throw err;
                    },
                    ([projectTemplate, projects]) => ({
                        projectTemplate,
                        projects,
                    }),
                ),
            );
        },
        enabled: Boolean(clickedId),
        meta: {
            errorMessage: "Failed to retrieve project template data.",
            onError: () => closeModal(),
        },
    });

    // fix stackId dom props
    const { stackId, ...modalProps } = modalStack.register(
        "project-template-details",
    );

    return (
        <>
            <Modal.Stack>
                {/* Modal window for showing the details of the clicked project template. */}
                <Modal.Root size="100%" centered {...modalProps}>
                    <Modal.Overlay />
                    <Modal.Content className="h-full w-full rounded-xl flex flex-col">
                        <Modal.Body className="p-0 flex-1 flex flex-col overflow-hidden">
                            <Stack className="flex-1">
                                {/* Template details */}
                                {retrieveQuery.data ? (
                                    <>
                                        <TemplateDetails
                                            modalStack={modalStack}
                                            projectTemplate={
                                                retrieveQuery.data
                                                    .projectTemplate
                                            }
                                            onClose={closeModal}
                                        />
                                    </>
                                ) : (
                                    <TemplateDetailsSkeleton />
                                )}
                            </Stack>
                        </Modal.Body>
                    </Modal.Content>
                </Modal.Root>
            </Modal.Stack>

            {/* Table to show available project templates. */}
            <DataTable
                highlightOnHover
                withTableBorder
                columns={columns}
                records={records}
                minHeight={150}
                noRecordsText="No project templates"
                onRowClick={async ({ record: { id } }) => {
                    modalStack.open("project-template-details");
                    setClickedId(id);
                }}
            />
        </>
    );
}
