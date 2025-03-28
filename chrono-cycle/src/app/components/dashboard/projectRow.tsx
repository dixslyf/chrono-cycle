"use client";

import { Paper, Text } from "@mantine/core";
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
    eventHeight: number;
    rowSpacing: number;
    expanded: boolean;
    onProjectClick: (project: Project) => void;
    toggleProject: (projectId: string) => void;
    topOffset: number; // computed vertical offset for this row
    headerHeight: number; // height for the header (e.g., 24px)
    onEventClick: (event: Event) => void;
}

const ProjectRow: React.FC<ProjectRowProps> = ({
    project,
    days,
    cellWidth,
    eventHeight,
    rowSpacing,
    expanded,
    onProjectClick,
    toggleProject: toggleProject,
    topOffset,
    headerHeight,
    onEventClick,
}) => {
    // find the index for the project start date
    const projectStartIndex = days.findIndex((d) =>
        areSameDay(d.date, project.startsAt),
    );
    if (projectStartIndex === -1) return null;

    // On-click handler for the chevron icon to toggle events.
    function chevronOnClick(e: React.MouseEvent<SVGElement>) {
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
            <div className="relative w-full" style={{ top: `${topOffset}px` }}>
                <Paper
                    withBorder
                    p={0}
                    className="absolute bg-gray-100 shadow-md rounded-md flex items-center justify-center text-sm font-bold text-gray-800 cursor-pointer"
                    style={{
                        left: `${projectStartIndex * cellWidth}px`,
                        width: `${cellWidth}px`,
                        height: `${headerHeight}px`,
                        lineHeight: `${headerHeight}px`,
                    }}
                    onClick={() => onProjectClick(project)}
                >
                    {project.name}
                    {expanded ? (
                        <ChevronUp
                            size={16}
                            className="ml-1"
                            onClick={chevronOnClick}
                        />
                    ) : (
                        <ChevronDown
                            size={16}
                            className="ml-1"
                            onClick={chevronOnClick}
                        />
                    )}
                </Paper>
            </div>
        );
    }

    const maxEndIndex = Math.max(...eventEndIndexes);

    // Calculate horizontal positioning using the project start index.
    const leftOffset = projectStartIndex * cellWidth;
    const width = (maxEndIndex - projectStartIndex + 1) * cellWidth;

    return (
        <div className="relative w-full" style={{ top: `${topOffset}px` }}>
            {/* Project Header */}
            <Paper
                withBorder
                p={0}
                className="bg-gray-100 shadow-md rounded-md flex items-center justify-center text-sm font-bold text-gray-800 cursor-pointer"
                style={{
                    marginLeft: `${leftOffset}px`,
                    width: `${width}px`,
                    // height: `${headerHeight}px`,
                    // lineHeight: `${headerHeight}px`,
                }}
                onClick={() => onProjectClick(project)}
            >
                <Text>{project.name}</Text>
                {expanded ? (
                    <ChevronUp
                        size={16}
                        className="ml-1"
                        onClick={chevronOnClick}
                    />
                ) : (
                    <ChevronDown
                        size={16}
                        className="ml-1"
                        onClick={chevronOnClick}
                    />
                )}
            </Paper>

            {/* Render each event under the header if expanded */}
            {expanded && (
                <div className="relative w-full">
                    {project.events.map((event, eventIndex) => {
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

                        // Place each event sequentially below the header.
                        const eventTopOffset =
                            headerHeight +
                            eventIndex * (eventHeight + rowSpacing);

                        return (
                            <EventBar
                                key={event.id}
                                event={event}
                                startIndex={eventStartIndex}
                                endIndex={eventEndIndex}
                                color="bg-blue-500"
                                cellWidth={cellWidth}
                                topOffset={eventTopOffset}
                                onEventClick={onEventClick}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ProjectRow;
