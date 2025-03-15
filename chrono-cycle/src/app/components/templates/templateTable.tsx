"use client";

import { Group, Modal, Stack, useModalsStack } from "@mantine/core";
import { sequenceT } from "fp-ts/Apply";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { DataTable } from "mantine-datatable";
import { useCallback, useState } from "react";

import { notifyError } from "@/app/utils/notifications";

import {
    ProjectOverview,
    ProjectTemplate,
    ProjectTemplateOverview,
} from "@/common/data/domain";

import { retrieveProjectTemplateAction } from "@/features/project-templates/retrieve/action";
import { listProjectsAction } from "@/features/projects/list/action";

import { listProjects } from "@/db/queries/projects/list";

import { CreateEventTemplateButton } from "./createEventButton";
import { DeleteTemplateButton } from "./deleteTemplateButton";
import { TemplateDetails, TemplateDetailsSkeleton } from "./templateDetails";

const columns = [
    { accessor: "name", title: "Name" },
    { accessor: "description", title: "Description" },
    { accessor: "createdAt", title: "Created at" },
    { accessor: "updatedAt", title: "Updated at" },
];

export function TemplateTable({
    entries,
}: {
    entries: ProjectTemplateOverview[];
}): React.ReactNode {
    // For keeping track of modals.
    const modalStack = useModalsStack([
        "project-template-details",
        "add-event",
    ]);

    const { close: modalStackClose } = modalStack;
    const closeModal = useCallback(
        () => modalStackClose("project-template-details"),
        [modalStackClose],
    );

    // State for storing the clicked project template.
    const [clickedData, setClickedData] = useState<{
        projectTemplate: ProjectTemplate;
        projects: ProjectOverview[];
    } | null>(null);

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

    // Retrieve data for a clicked project template.
    async function retrieveProjectTemplateData(projectTemplateId: string) {
        // Retrieve the template data and its projects.
        const [ptResult, projectsResult] = await Promise.all([
            retrieveProjectTemplateAction({ projectTemplateId }),
            listProjectsAction({ projectTemplateId }),
        ]);

        pipe(
            sequenceT(E.Apply)(ptResult, projectsResult),
            E.match(
                (_err) => {
                    modalStack.close("project-template-details");
                    notifyError({
                        message: "Failed to retrieve project template data.",
                    });
                },
                ([projectTemplate, projects]) =>
                    setClickedData({ projectTemplate, projects }),
            ),
        );
    }

    return (
        <>
            <Modal.Stack>
                {/* Modal window for showing the details of the clicked project template. */}
                <Modal
                    title="Project Template Details"
                    size="auto"
                    centered
                    {...modalStack.register("project-template-details")}
                >
                    <Stack>
                        {/* Template details */}
                        {clickedData ? (
                            <>
                                <TemplateDetails
                                    projectTemplateData={
                                        clickedData.projectTemplate
                                    }
                                    projects={clickedData.projects}
                                />

                                {/* Delete and create event buttons */}
                                <Group justify="flex-end">
                                    <DeleteTemplateButton
                                        projectTemplateId={
                                            clickedData.projectTemplate.id
                                        }
                                        onSuccess={closeModal}
                                    />
                                    <CreateEventTemplateButton
                                        projectTemplateId={
                                            clickedData.projectTemplate.id
                                        }
                                        modalStack={modalStack}
                                    />
                                </Group>
                            </>
                        ) : (
                            <TemplateDetailsSkeleton />
                        )}
                    </Stack>
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
                    await retrieveProjectTemplateData(id);
                }}
            />
        </>
    );
}
