"use client";

import { useState } from "react";
import { Table, Input } from "@chakra-ui/react";

const EventTable = () => {
    const [events, setEvents] = useState<{ name: string; duration: string }[]>(
        [],
    );
    const [newEventName, setNewEventName] = useState("");

    const handleCreateEvent = () => {
        if (newEventName.trim() !== "") {
            setEvents([
                ...events,
                {
                    name: newEventName,
                    duration: "TDB",
                },
            ]);
            setNewEventName("");
        }
    };

    return (
        <>
            <Table.Root striped>
                {events.length > 0 ? (
                    <>
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
                        <Table.Body>
                            {events.map((event, index) => (
                                <Table.Row key={index} className="border-2">
                                    <Table.Cell className="bg-palette3">
                                        {event.name}
                                    </Table.Cell>
                                    <Table.Cell className="bg-palette3">
                                        {event.duration}
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </>
                ) : (
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell className="bg-palette3">
                                <Input
                                    variant="outline"
                                    placeholder="Create new event..."
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
                )}
            </Table.Root>
        </>
    );
};

export default EventTable;
