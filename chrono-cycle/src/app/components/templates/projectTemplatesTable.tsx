"use client";

import {
    Center,
    Loader,
    Modal,
    ScrollArea,
    Table,
    Text,
    useModalsStack,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { DataTable } from "mantine-datatable";
import { useCallback, useState } from "react";

import { formatDate } from "@/app/utils/dates";
import { listProjectTemplatesOptions } from "@/app/utils/queries/listProjectTemplates";

import { ProjectTemplate } from "@/common/data/domain";

import { retrieveProjectTemplateAction } from "@/features/project-templates/retrieve/action";

import { ProjectTemplateDetails } from "./projectTemplateDetails";

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
                <Modal
                    centered
                    size="100%"
                    radius="xl"
                    withCloseButton={false}
                    padding={0}
                    {...modalStack.register("project-template-details")}
                >
                    {/* Template details */}
                    <ProjectTemplateDetails
                        modalStack={modalStack}
                        projectTemplate={retrieveQuery.data}
                        onClose={closeModal}
                        isLoading={retrieveQuery.isPending}
                    />
                </Modal>
            </Modal.Stack>

            {/* Table to show available project templates. */}
            {/* <DataTable
                highlightOnHover
                withTableBorder
                columns={columns}
                records={records}
                fetching={listPtsQuery.isPending}
                minHeight={150}
                noRecordsText="No project templates"
                onRowClick={async ({ record: { id } }) => {
                    modalStack.open("project-template-details");
                    setClickedId(id);
                }}
            /> */}
            <ScrollArea>
                <Table highlightOnHover>
                    <Table.Thead>
                        <Table.Tr>
                            {columns.map((column) => (
                                <Table.Th key={column.accessor}>
                                    {column.title}
                                </Table.Th>
                            ))}
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {listPtsQuery.isPending ? (
                            <Table.Tr>
                                <Table.Td colSpan={columns.length}>
                                    <Center>
                                        <Loader size="sm" />
                                    </Center>
                                </Table.Td>
                            </Table.Tr>
                        ) : records.length === 0 ? (
                            <Table.Tr>
                                <Table.Td colSpan={columns.length}>
                                    <Center>
                                        <Text>No Project Template</Text>
                                    </Center>
                                </Table.Td>
                            </Table.Tr>
                        ) : (
                            records.map((record) => (
                                <Table.Tr
                                    key={record.id}
                                    className="cursor-pointer"
                                    onClick={() => {
                                        modalStack.open(
                                            "project-template-details",
                                        );
                                        setClickedId(record.id);
                                    }}
                                >
                                    {columns.map((column) => (
                                        <Table.Td
                                            key={`${record.id}-${column.accessor}`}
                                        >
                                            {record[column.accessor]}
                                        </Table.Td>
                                    ))}
                                </Table.Tr>
                            ))
                        )}
                    </Table.Tbody>
                </Table>
            </ScrollArea>
        </>
    );
}
