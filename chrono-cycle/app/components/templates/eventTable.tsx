"use client";

import React, { useState } from "react";
import { Table, Input } from "@chakra-ui/react";

// event type
interface EventItem {
    name: string;
    duration: string;
    description?: string;
}

interface EventTableProps {
    onRowClick: (event: EventItem) => void;
}

const EventTable: React.FC<EventTableProps> = ({ onRowClick }) => {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [newEventName, setNewEventName] = useState("");

    const handleCreateEvent = () => {
        if (newEventName.trim() !== "") {
            setEvents([
                ...events,
                { name: newEventName, duration: "TBD", description: "" },
            ]);
            setNewEventName("");
        }
    };

    // make table row clickable
    const handleRowClick = (index: number) => {
        onRowClick(events[index]);
    };

    return (
        <>
            <Table.Root striped>
                {/* show header only if there is existing events */}
                {events.length > 0 && (
                    <Table.Header>
                        <Table.Row className="bg-palette3">
                            <Table.ColumnHeader className="text-palette5">
                                Name
                            </Table.ColumnHeader>
                            <Table.ColumnHeader className="text-palette5">
                                Duration
                            </Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                )}

                <Table.Body>
                    {/* Display events */}
                    {events.map((event, index) => (
                        <Table.Row
                            key={index}
                            className="border-2 cursor-pointer hover:bg-gray-500"
                            onClick={() => handleRowClick(index)}
                        >
                            <Table.Cell className="bg-palette3">
                                {event.name}
                            </Table.Cell>
                            <Table.Cell className="bg-palette3">
                                {event.duration}
                            </Table.Cell>
                        </Table.Row>
                    ))}

                    {/* Always visible Create event row */}
                    <Table.Row className="border-2">
                        <Table.Cell className="bg-palette3" colSpan={2}>
                            <Input
                                variant="outline"
                                placeholder="Create new Event..."
                                value={newEventName}
                                onChange={(e) =>
                                    setNewEventName(e.target.value)
                                }
                                onKeyDown={(e) =>
                                    e.key === "Enter" && handleCreateEvent()
                                }
                            />
                        </Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table.Root>
        </>
    );
};

export default EventTable;
