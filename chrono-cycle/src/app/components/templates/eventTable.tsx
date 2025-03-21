"use client";

import { Table, useModalsStack } from "@mantine/core";
import React from "react";

import { CreateEventTemplateButton } from "./createEventButton";

// placeholder eventOverview
interface EventOverview {
    id: string;
    name: string;
    offsetDays: number;
    type: string;
    duration: number | null;
}

const placeholderEvents: EventOverview[] = [
    {
        id: "1",
        name: "Sample Activity",
        offsetDays: 0,
        type: "activity",
        duration: 5,
    },
    {
        id: "2",
        name: "Sample Event",
        offsetDays: 3,
        type: "task",
        duration: null,
    },
];

interface EventsTableProps<T extends string> {
    projectTemplateId: string;
    modalStack: ReturnType<typeof useModalsStack<T | "add-event">>;
    events?: EventOverview[];
}

export function EventsTable<T extends string>({
    projectTemplateId,
    modalStack,
    events,
}: EventsTableProps<T>): React.ReactNode {
    // passed events or fallback or fallback to placeholderEvents for now
    const eventList = events ?? placeholderEvents;

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
                {eventList.map(({ id, name, offsetDays, type, duration }) => (
                    <Table.Tr key={id}>
                        <Table.Td>{name}</Table.Td>
                        <Table.Td>{offsetDays.toString()}</Table.Td>
                        <Table.Td>{type}</Table.Td>
                        <Table.Td>
                            {type === "activity"
                                ? duration !== null
                                    ? duration.toString()
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
    );
}
