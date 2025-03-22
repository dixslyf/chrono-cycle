"use client";

import { Box, Modal, Table, useModalsStack } from "@mantine/core";
import React, { useCallback, useState } from "react";

import { EventTemplate } from "@/common/data/domain";

import { CreateEventTemplateButton } from "./createEventButton";
import DisplayEventTemplateDetails from "./eventTemplateDetails";

interface EventsTableProps<T extends string> {
    projectTemplateId: string;
    modalStack: ReturnType<
        typeof useModalsStack<T | "add-event" | "event-details">
    >;
    eventTemplates: EventTemplate[];
}

export function EventsTable<T extends string>({
    projectTemplateId,
    modalStack,
    eventTemplates,
}: EventsTableProps<T>): React.ReactNode {
    const { close: modalStackClose } = modalStack;
    const closeModal = useCallback(
        () => modalStackClose("event-details"),
        [modalStackClose],
    );

    // local state to track the event
    const [selectedEventTemplate, setSelectedEventTemplate] =
        useState<EventTemplate | null>(null);

    // register new modal
    const { stackId, ...eventModalProps } =
        modalStack.register("event-details");

    // handle row click
    const handleRowClick = (eventTemplate: EventTemplate) => {
        setSelectedEventTemplate(eventTemplate);
        modalStack.open("event-details");
    };

    return (
        <>
            {/* modal to display event details */}
            <Modal.Stack>
                <Modal.Root size="100%" centered {...eventModalProps}>
                    <Modal.Overlay />
                    <Modal.Content className="h-full w-full rounded-xl flex flex-col">
                        <Modal.Body className="p-0 flex-1 overflow-hidden">
                            {selectedEventTemplate ? (
                                <DisplayEventTemplateDetails
                                    eventTemplate={selectedEventTemplate}
                                    onClose={closeModal}
                                />
                            ) : (
                                <Box>Loading event details...</Box>
                            )}
                        </Modal.Body>
                    </Modal.Content>
                </Modal.Root>
            </Modal.Stack>

            <Table className="border-gray-400 rounded-xl" highlightOnHover>
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
                    {eventTemplates.map((eventTemplate) => (
                        <Table.Tr
                            key={eventTemplate.id}
                            onClick={() => handleRowClick(eventTemplate)}
                            className="cursor-pointer"
                        >
                            <Table.Td>{eventTemplate.name}</Table.Td>
                            <Table.Td>{eventTemplate.offsetDays}</Table.Td>
                            <Table.Td>{eventTemplate.eventType}</Table.Td>
                            <Table.Td>
                                {eventTemplate.eventType === "activity"
                                    ? eventTemplate.duration !== null
                                        ? eventTemplate.duration.toString()
                                        : "-"
                                    : "-"}
                            </Table.Td>
                        </Table.Tr>
                    ))}
                    {/* Always display this add event row */}
                    <Table.Tr>
                        <Table.Td
                            className="text-center hover:bg-gray-100 pt-2"
                            colSpan={4}
                        >
                            <CreateEventTemplateButton
                                projectTemplateId={projectTemplateId}
                                modalStack={modalStack}
                            />
                        </Table.Td>
                    </Table.Tr>
                </Table.Tbody>
            </Table>
        </>
    );
}
