"use client";

import { Center, Group, Paper, Stack, Text } from "@mantine/core";
import { ChevronDown, ChevronUp } from "lucide-react";
import React from "react";
import { match } from "ts-pattern";

import { Event, Project } from "@/common/data/domain";
import { areSameDay, Day } from "@/common/dates";

import EventBar from "./eventBar";

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
    const calculatedWidth = (maxEndIndex - projectStartIndex + 1) * cellWidth;
    const width = Math.max(calculatedWidth, cellWidth);

    const sortedEvents = project.events.sort((e1, e2) => {
        // Activities should be shown above tasks.
        if (e1.eventType === "activity" && e2.eventType === "task") {
            return -1;
        }
        if (e1.eventType === "task" && e2.eventType === "activity") {
            return 1;
        }

        // At this point, both events must have the same event type.

        // Earlier events should be shown first.
        if (e1.startDate < e2.startDate) {
            return -1;
        }
        if (e2.startDate > e1.startDate) {
            return 1;
        }

        // Same date.

        // Longer events should be shown first.
        if (e1.duration > e2.duration) {
            return -1;
        }
        if (e2.duration > e1.duration) {
            return 1;
        }

        return 0;
    });

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
                <Group className="w-full h-full flex-nowrap" align="stretch">
                    <Text
                        className="text-lg font-semibold flex-grow px-2 py-2"
                        truncate="end"
                    >
                        {project.name}
                    </Text>
                    <Center
                        className="items-center justify-center transition-colors duration-200 cursor-pointer hover:bg-gray-200 px-1"
                        onClick={chevronOnClick}
                    >
                        {expanded ? (
                            <ChevronUp size={20} />
                        ) : (
                            <ChevronDown size={20} />
                        )}
                    </Center>
                </Group>
            </Paper>

            {/* Render each event under the header if expanded */}
            {expanded && (
                <Stack gap="xs" mt="xs" className="relative w-full">
                    {sortedEvents.map((event) => {
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

                        const [bg, textColor] = match(event.status)
                            .with("none", () => ["yellow.5", "black"])
                            .with("not started", () => ["red", "white"])
                            .with("in progress", () => ["blue", "white"])
                            .with("completed", () => ["brown", "white"])
                            .exhaustive();

                        return (
                            <EventBar
                                key={event.id}
                                event={event}
                                startIndex={eventStartIndex}
                                endIndex={eventEndIndex}
                                cellWidth={cellWidth}
                                bg={bg}
                                textColor={textColor}
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
