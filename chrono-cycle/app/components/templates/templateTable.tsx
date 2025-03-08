"use client";

import { Modal, Group, Stack, useModalsStack } from "@mantine/core";
import { DataTable } from "mantine-datatable";
import { useCallback, useState } from "react";

import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

import { notifyError } from "@/app/utils/notifications";
import { TemplateDetails, TemplateDetailsSkeleton } from "./templateDetails";
import { DeleteTemplateButton } from "./deleteTemplateButton";

import { retrieveProjectTemplateAction } from "@/server/project-templates/retrieve/action";
import { ProjectTemplateOverview } from "@/server/common/data";
import { ProjectTemplateData } from "@/server/project-templates/retrieve/data";
import { CreateEventTemplateButton } from "./createEventButton";

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
    const [clickedProjectTemplateData, setClickedProjectTemplateData] =
        useState<ProjectTemplateData | null>(null);

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
        const result = await retrieveProjectTemplateAction(projectTemplateId);
        pipe(
            result,
            E.match(
                (_err) => {
                    modalStack.close("project-template-details");
                    notifyError({
                        message: "Failed to retrieve project template data.",
                    });
                },
                (data) => setClickedProjectTemplateData(data),
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
                        {clickedProjectTemplateData ? (
                            <>
                                <TemplateDetails
                                    projectTemplateData={
                                        clickedProjectTemplateData
                                    }
                                />

                                {/* Delete and create event buttons */}
                                <Group justify="flex-end">
                                    <DeleteTemplateButton
                                        projectTemplateId={
                                            clickedProjectTemplateData.id
                                        }
                                        onSuccess={closeModal}
                                    />
                                    <CreateEventTemplateButton
                                        projectTemplateId={
                                            clickedProjectTemplateData.id
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
