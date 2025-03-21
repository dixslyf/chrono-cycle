"use client";

import { DataTable } from "mantine-datatable";
import React from "react";

// placeholder eventOverview
interface EventOverview {
    id: string;
    name: string;
    offsetDays: number;
    type: string;
    duration: number | null;
}

const columns = [
    { accessor: "name", title: "Name" },
    { accessor: "offsetDays", title: "Offset Days" },
    { accessor: "type", title: "Type" },
    { accessor: "duration", title: "Duration" },
];

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

export function EventsTable(): React.ReactNode {
    const records = placeholderEvents.map(
        ({ id, name, offsetDays, type, duration }) => ({
            id,
            name,
            offsetDays: offsetDays.toString(),
            type,
            // Only display duration if the event type is "activity"
            duration:
                type === "activity"
                    ? duration
                        ? duration.toString()
                        : "-"
                    : "-",
        }),
    );

    return (
        <DataTable
            highlightOnHover
            withTableBorder
            columns={columns}
            records={records}
            minHeight={150}
            noRecordsText="No events"
        />
    );
}
