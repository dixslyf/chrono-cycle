"use client";

import {
    Box,
    Group,
    Modal,
    Pagination,
    Table,
    useModalsStack,
} from "@mantine/core";
import React, { useCallback, useState } from "react";

import { EventTemplate } from "@/common/data/domain";

import { CreateEventTemplateButton } from "./createEventButton";
import EventTemplateDetails from "./eventTemplateDetails";

interface EventsTableProps<T extends string> {
    projectTemplateId: string;
    modalStack: ReturnType<
        typeof useModalsStack<"add-event" | "event-details" | T>
    >;
    eventTemplates: EventTemplate[];
    rowsPerPage?: number;
}

function InnerEventTemplatesTable<T extends string>({
    projectTemplateId,
    modalStack,
    eventTemplates,
    rowsPerPage,
    setSelectedEventTemplate,
}: Required<EventsTableProps<T>> & {
    setSelectedEventTemplate: (eventTemplate: EventTemplate) => void;
}) {
    // pagination state
    const [activePage, setActivePage] = useState(1);

    const totalPages = Math.ceil(eventTemplates.length / rowsPerPage);

    // get current page data
    const startIndex = (activePage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentPageData = eventTemplates.slice(startIndex, endIndex);

    // generate empty rows if needed
    const emptyRowsCount = Math.max(0, rowsPerPage - currentPageData.length);
    const emptyRows = Array(emptyRowsCount).fill(null);

    // handle row click
    const handleRowClick = (eventTemplate: EventTemplate) => {
        setSelectedEventTemplate(eventTemplate);
        modalStack.open("event-details");
    };

    return (
        <>
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th className="font-semibold">Name</Table.Th>
                        <Table.Th className="font-semibold">
                            Offset Days
                        </Table.Th>
                        <Table.Th className="font-semibold">Type</Table.Th>
                        <Table.Th className="font-semibold">Duration</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {currentPageData.map((eventTemplate) => (
                        <Table.Tr
                            key={eventTemplate.id}
                            onClick={() => handleRowClick(eventTemplate)}
                            className="cursor-pointer hover:bg-gray-200"
                        >
                            <Table.Td className="w-2/5">
                                {eventTemplate.name}
                            </Table.Td>
                            <Table.Td className="w-1/5">
                                {eventTemplate.offsetDays}
                            </Table.Td>
                            <Table.Td className="w-1/5">
                                {eventTemplate.eventType[0].toUpperCase() +
                                    eventTemplate.eventType.slice(1)}
                            </Table.Td>
                            <Table.Td className="w-1/5">
                                {eventTemplate.eventType === "activity"
                                    ? eventTemplate.duration !== null
                                        ? eventTemplate.duration.toString()
                                        : "-"
                                    : "-"}
                            </Table.Td>
                        </Table.Tr>
                    ))}
                    {/* add empty rows to maintain fixed height */}
                    {emptyRows.map((_, index) => (
                        <Table.Tr key={`empty-row-${index}`}>
                            <Table.Td colSpan={4}>&nbsp;</Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>

            {/* pagination & create event button */}
            <Group className="items-center justify-between mt-4">
                {/* empty box */}
                <Box className="flex-1" />

                <Group className="flex-1" justify="center">
                    {totalPages > 1 && (
                        <Pagination
                            value={activePage}
                            onChange={setActivePage}
                            total={totalPages}
                        />
                    )}
                </Group>

                <Group className="flex-1" justify="flex-end">
                    <CreateEventTemplateButton
                        projectTemplateId={projectTemplateId}
                        modalStack={modalStack}
                    />
                </Group>
            </Group>
        </>
    );
}

export function EventTemplatesTable<T extends string>({
    projectTemplateId,
    modalStack,
    eventTemplates,
    rowsPerPage = 7,
}: EventsTableProps<T>): React.ReactNode {
    const { close: modalStackClose } = modalStack;
    const closeEventDetailsModal = useCallback(
        () => modalStackClose("event-details"),
        [modalStackClose],
    );

    // local state to track the event
    const [selectedEventTemplate, setSelectedEventTemplate] =
        useState<EventTemplate | null>(null);

    return (
        <>
            {/* Modal to display event details */}
            <Modal
                centered
                size="100%"
                radius="xl"
                withCloseButton={false}
                padding={0}
                {...modalStack.register("event-details")}
            >
                {selectedEventTemplate ? (
                    <EventTemplateDetails
                        eventTemplate={selectedEventTemplate}
                        onClose={closeEventDetailsModal}
                    />
                ) : (
                    <Box>Loading event details...</Box>
                )}
            </Modal>

            <InnerEventTemplatesTable
                projectTemplateId={projectTemplateId}
                modalStack={modalStack}
                eventTemplates={eventTemplates}
                rowsPerPage={rowsPerPage}
                setSelectedEventTemplate={setSelectedEventTemplate}
            />
        </>
    );
}
