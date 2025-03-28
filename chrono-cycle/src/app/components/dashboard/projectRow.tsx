"use client";

import { Group, Paper, Stack, Text } from "@mantine/core";
import { ChevronDown, ChevronUp } from "lucide-react";
import React from "react";

import { areSameDay } from "@/app/utils/dates";

import { Event, Project } from "@/common/data/domain";

import EventBar from "./eventBar";
import { Day } from "./timeline";

interface ProjectRowProps {
    project: Project;
    days: Day[];
    cellWidth: number;
    expanded: boolean;
    onProjectClick: (project: Project) => void;
    toggleProject: (projectId: string) => void;
    onEventClick: (event: Event) => void;
}

const ProjectRow: React.FC<ProjectRowProps> = ({
    project,
    days,
    cellWidth,
    expanded,
    onProjectClick,
    toggleProject: toggleProject,
    onEventClick,
}) => {
    // find the index for the project start date
    const projectStartIndex = days.findIndex((d) =>
        areSameDay(d.date, project.startsAt),
    );
    if (projectStartIndex === -1) return null;

    // On-click handler for the chevron icon to toggle events.
    function chevronOnClick(e: React.MouseEvent<HTMLDivElement>) {
        // Needed to prevent the event from bubbling up to the bar itself.
        // Otherwise, clicking on the chevron icon will also open the
        // project details modal.
        e.stopPropagation();
        toggleProject(project.id);
    }

    const eventEndIndexes = project.events
        .map((event) => {
            const endDate = new Date(event.startDate);
            endDate.setDate(endDate.getDate() + event.duration - 1);
            return days.findIndex((d) => areSameDay(d.date, endDate));
        })
        .filter((index) => index !== -1);

    if (eventEndIndexes.length === 0) {
        return (
            <div className="relative w-full mt-4">
                <Paper
                    withBorder
                    p={0}
                    className="bg-gray-100 shadow-md rounded-md flex items-center justify-center cursor-pointer"
                    style={{
                        marginLeft: `${cellWidth * projectStartIndex}px`,
                        width: `${cellWidth}px`,
                    }}
                    onClick={() => onProjectClick(project)}
                >
                    <Group className="w-full h-full" align="stretch">
                        <Text className="text-lg font-semibold flex-grow pl-4 py-2">
                            {project.name}
                        </Text>
                        <Group
                            className="w-1/12 items-center justify-center transition-colors duration-200 cursor-pointer hover:bg-gray-200"
                            onClick={chevronOnClick}
                        >
                            {expanded ? (
                                <ChevronUp size={16} />
                            ) : (
                                <ChevronDown size={16} />
                            )}
                        </Group>
                    </Group>
                </Paper>
            </div>
        );
    }

    const maxEndIndex = Math.max(...eventEndIndexes);

    // Calculate horizontal positioning using the project start index.
    const leftOffset = projectStartIndex * cellWidth;
    const width = (maxEndIndex - projectStartIndex + 1) * cellWidth;

    return (
        <div className="relative w-full mt-4">
            {/* Project Header */}
            <Paper
                withBorder
                p={0}
                className="bg-gray-100 shadow-md rounded-md flex items-center justify-center cursor-pointer"
                style={{
                    marginLeft: `${leftOffset}px`,
                    width: `${width}px`,
                }}
                onClick={() => onProjectClick(project)}
            >
                <Group className="w-full h-full" align="stretch">
                    <Text className="text-lg font-semibold flex-grow pl-4 py-2">
                        {project.name}
                    </Text>
                    <Group
                        className="w-1/12 items-center justify-center transition-colors duration-200 cursor-pointer hover:bg-gray-200"
                        onClick={chevronOnClick}
                    >
                        {expanded ? (
                            <ChevronUp size={16} />
                        ) : (
                            <ChevronDown size={16} />
                        )}
                    </Group>
                </Group>
            </Paper>

            {/* Render each event under the header if expanded */}
            {expanded && (
                <Stack gap="lg" className="relative w-full">
                    {project.events.map((event) => {
                        // Calculate start and end dates for the event.
                        const eventStartDate = event.startDate;
                        const eventEndDate = new Date(eventStartDate);
                        eventEndDate.setDate(
                            eventStartDate.getDate() + event.duration - 1,
                        );

                        const eventStartIndex = days.findIndex((d) =>
                            areSameDay(d.date, eventStartDate),
                        );
                        const eventEndIndex = days.findIndex((d) =>
                            areSameDay(d.date, eventEndDate),
                        );
                        if (eventStartIndex === -1 || eventEndIndex === -1)
                            return null;

                        return (
                            <EventBar
                                key={event.id}
                                event={event}
                                startIndex={eventStartIndex}
                                endIndex={eventEndIndex}
                                color="bg-blue-500"
                                cellWidth={cellWidth}
                                onEventClick={onEventClick}
                            />
                        );
                    })}
                </Stack>
            )}
        </div>
    );
};

export default ProjectRow;
