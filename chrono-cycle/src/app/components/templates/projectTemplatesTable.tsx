"use client";

import { Modal, useModalsStack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { sequenceT } from "fp-ts/Apply";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { DataTable } from "mantine-datatable";
import { useCallback, useState } from "react";

import { formatDate } from "@/app/utils/dates";

import {
    ProjectOverview,
    ProjectTemplate,
    ProjectTemplateOverview,
} from "@/common/data/domain";

import { retrieveProjectTemplateAction } from "@/features/project-templates/retrieve/action";
import { listProjectsAction } from "@/features/projects/list/action";

import {
    ProjectTemplateDetails,
    ProjectTemplateDetailsSkeleton,
} from "./projectTemplateDetails";

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

export function ProjectTemplatesTable({
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
            createdAt: formatDate(createdAt, { withTime: true }),
            updatedAt: formatDate(updatedAt, { withTime: true }),
        }),
    );

    // For keeping track of modals.
    const modalStack = useModalsStack([
        "project-template-details",
        "add-event",
        "create-project",
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

    return (
        <>
            <Modal.Stack>
                {/* Modal window for showing the details of the clicked project template. */}
                <Modal
                    centered
                    size="100%"
                    radius="xl"
                    withCloseButton={false}
                    padding={0}
                    {...modalStack.register("project-template-details")}
                >
                    {/* Template details */}
                    {retrieveQuery.data ? (
                        <>
                            <ProjectTemplateDetails
                                modalStack={modalStack}
                                projectTemplate={
                                    retrieveQuery.data.projectTemplate
                                }
                                onClose={closeModal}
                            />
                        </>
                    ) : (
                        <ProjectTemplateDetailsSkeleton />
                    )}
                </Modal>
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
