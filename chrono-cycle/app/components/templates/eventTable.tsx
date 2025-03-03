"use client";

import React, { useState } from "react";
import { Table, Input, Textarea } from "@chakra-ui/react";
import ModalWrapper from "./modalWrapper";
import { title } from "process";

// event type
interface EventItem {
    name: string;
    duration: string;
    description?: string;
}

// modal component display event & autosave on close.
interface EventDetailsModalProps {
    event: EventItem;
    onClose: (updateDescription: string) => void;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
    event,
    onClose,
}) => {
    // local state for description
    const [description, setDescription] = useState(event.description || "");

    return (
        <ModalWrapper
            isOpen={true}
            toggleModal={() => onClose(description)}
            title="Event Details"
        >
            <div>
                <div className="mb-4">
                    <label className="block font-bold">Name:</label>
                    <div>{event.name}</div>
                </div>
                <div className="mb-4">
                    <label className="block font-bold">Description:</label>
                    <Textarea
                        variant="outline"
                        placeholder="Add description..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
            </div>
        </ModalWrapper>
    );
};

const EventTable = () => {
    const [events, setEvents] = useState<EventItem[]>([]);
    const [newEventName, setNewEventName] = useState("");
    // when row is clicked, track index
    const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(
        null,
    );

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
        setSelectedEventIndex(index);
    };

    // auto saves description on close
    const handleModalClose = (updateDescription: string) => {
        if (selectedEventIndex !== null) {
            setEvents((prev) => {
                const updatedEvents = [...prev];
                updatedEvents[selectedEventIndex] = {
                    ...updatedEvents[selectedEventIndex],
                    description: updateDescription,
                };
                return updatedEvents;
            });
        }
        setSelectedEventIndex(null);
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
                                <Table.Row
                                    key={index}
                                    className="border-2 cursor-pointer hover:bg-gray-200"
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
                        </Table.Body>
                    </>
                ) : (
                    <Table.Body>
                        <Table.Row>
                            <Table.Cell className="bg-palette3">
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
                )}
            </Table.Root>
            {/* Render the event details modal is an event row is clicked */}
            {selectedEventIndex !== null && (
                <EventDetailsModal
                    event={events[selectedEventIndex]}
                    onClose={handleModalClose}
                />
            )}
        </>
    );
};

export default EventTable;
