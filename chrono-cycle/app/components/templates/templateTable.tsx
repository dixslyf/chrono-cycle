"use client";

import { Button, Modal, Group, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { DataTable } from "mantine-datatable";
import { useState } from "react";

import { ProjectTemplateOverview } from "@/server/common/data";
import { TemplateDetails } from "./templateDetails";
import { DeleteTemplateButton } from "./deleteTemplateButton";

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

    // State for storing the clicked project template (encoded) ID.
    const [clickedId, setClickedId] = useState<string | null>(null);

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
                    {/* Safety: `clickedId` is guaranteed to be a string since we only show the modal after setting it.*/}
                    <TemplateDetails
                        projectTemplateId={clickedId as string}
                        onRetrieveFail={() => closeModal}
                    />

                    {/* Delete and close buttons */}
                    <Group justify="flex-end">
                        {/* Safety: `clickedId` is guaranteed to be a string since we only show the modal after setting it.*/}
                        <DeleteTemplateButton
                            projectTemplateId={clickedId as string}
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
                onRowClick={({ record: { id } }) => {
                    setClickedId(id);
                    openModal();
                }}
            />
        </>
    );
}
