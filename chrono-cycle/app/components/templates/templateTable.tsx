"use client";

import { Button, Modal, Group, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { DataTable } from "mantine-datatable";
import { useState } from "react";

import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

import { notifyError } from "@/app/utils/notifications";
import { TemplateDetails, TemplateDetailsSkeleton } from "./templateDetails";
import { DeleteTemplateButton } from "./deleteTemplateButton";

import { retrieveProjectTemplateAction } from "@/server/project-templates/retrieve/action";
import { ProjectTemplateOverview } from "@/server/common/data";
import { ProjectTemplateData } from "@/server/project-templates/retrieve/data";

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
    // For opening / closing the project template details modal window.
    const [opened, { open: openModal, close: closeModal }] = useDisclosure();

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
                    closeModal();
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
            {/* Modal window for showing the details of the clicked project template. */}
            <Modal
                title="Project Template Details"
                opened={opened}
                onClose={closeModal}
                size="auto"
                centered
            >
                <Stack>
                    {/* Template details */}
                    {clickedProjectTemplateData ? (
                        <TemplateDetails
                            projectTemplateData={clickedProjectTemplateData}
                        />
                    ) : (
                        <TemplateDetailsSkeleton />
                    )}

                    {/* Delete and close buttons */}
                    <Group justify="flex-end">
                        {/* Safety: `id` is guaranteed to be non-null since we only show the modal after setting it.*/}
                        <DeleteTemplateButton
                            projectTemplateId={
                                clickedProjectTemplateData?.id as string
                            }
                            onSuccess={closeModal}
                        />
                        <Button variant="default" onClick={closeModal}>
                            Close
                        </Button>
                    </Group>
                </Stack>
            </Modal>

            {/* Table to show available project templates. */}
            <DataTable
                highlightOnHover
                withTableBorder
                columns={columns}
                records={records}
                minHeight={150}
                noRecordsText="No project templates"
                onRowClick={async ({ record: { id } }) => {
                    openModal();
                    await retrieveProjectTemplateData(id);
                }}
            />
        </>
    );
}
