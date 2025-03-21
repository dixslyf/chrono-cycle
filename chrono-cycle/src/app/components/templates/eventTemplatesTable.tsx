"use client";

import { Table, useModalsStack } from "@mantine/core";
import React from "react";

import { EventTemplate } from "@/common/data/domain";

import { CreateEventTemplateButton } from "./createEventButton";

interface EventsTableProps<T extends string> {
    projectTemplateId: string;
    modalStack: ReturnType<typeof useModalsStack<T | "add-event">>;
    eventTemplates: EventTemplate[];
}

export function EventsTable<T extends string>({
    projectTemplateId,
    modalStack,
    eventTemplates,
}: EventsTableProps<T>): React.ReactNode {
    return (
        <Table className="border-gray-400 rounded-xl">
            <Table.Thead>
                <Table.Tr>
                    <Table.Th className="font-semibold">Name</Table.Th>
                    <Table.Th className="font-semibold">Offset Days</Table.Th>
                    <Table.Th className="font-semibold">Type</Table.Th>
                    <Table.Th className="font-semibold">Duration</Table.Th>
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {eventTemplates.map(
                    ({ id, name, offsetDays, eventType, duration }) => (
                        <Table.Tr key={id}>
                            <Table.Td>{name}</Table.Td>
                            <Table.Td>{offsetDays}</Table.Td>
                            <Table.Td>{eventType}</Table.Td>
                            <Table.Td>
                                {eventType === "activity"
                                    ? duration !== null
                                        ? duration.toString()
                                        : "-"
                                    : "-"}
                            </Table.Td>
                        </Table.Tr>
                    ),
                )}
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
    );
}
