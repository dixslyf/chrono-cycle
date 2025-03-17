"use client";

import { DataTable } from "mantine-datatable";

import { ProjectOverview } from "@/common/data/domain";

const columns = [
    { accessor: "name", title: "Name" },
    { accessor: "description", title: "Description" },
    { accessor: "startsAt", title: "Start Date" },
    { accessor: "createdAt", title: "Created at" },
    { accessor: "updatedAt", title: "Updated at" },
];

export function ProjectsTable({
    entries,
}: {
    entries: ProjectOverview[];
}): React.ReactNode {
    // Entries for the table.
    const records = entries.map(
        ({ id, name, description, startsAt, createdAt, updatedAt }) => ({
            id,
            name,
            description,
            startsAt: startsAt.toString(),
            createdAt: createdAt.toString(),
            updatedAt: updatedAt.toString(),
        }),
    );

    return (
        <DataTable
            highlightOnHover
            withTableBorder
            columns={columns}
            records={records}
            minHeight={150}
            noRecordsText="No project templates"
        />
    );
}
