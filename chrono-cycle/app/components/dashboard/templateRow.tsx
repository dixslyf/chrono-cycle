"use client";
import React from "react";
import { Paper } from "@mantine/core";
import { ChevronUp, ChevronDown } from "lucide-react";
import EventBar from "./eventBar";
import { Day, Event, EventTemplate } from "./timeline";

interface TemplateRowProps {
    template: EventTemplate;
    events: Event[];
    days: Day[];
    projectStartDate: Date;
    cellWidth: number;
    eventHeight: number;
    rowSpacing: number;
    expanded: boolean;
    toggleTemplate: (templateId: string) => void;
    topOffset: number; // computed vertical offset for this row
    headerHeight: number; // height for the header (e.g., 24px)
}

const TemplateRow: React.FC<TemplateRowProps> = ({
    template,
    events,
    days,
    projectStartDate,
    cellWidth,
    eventHeight,
    rowSpacing,
    expanded,
    toggleTemplate,
    topOffset,
    headerHeight,
}) => {
    // Always start at the project start date.
    const projectStartIndex = days.findIndex(
        (d) => d.date.getTime() === projectStartDate.getTime(),
    );

    // For the end index, determine the farthest day among the events in this template.
    const eventEndIndexes = events.map((event) => {
        const endDate = new Date(projectStartDate);
        endDate.setDate(
            endDate.getDate() + event.offsetDays + event.duration - 1,
        );
        return days.findIndex((d) => d.date.getTime() === endDate.getTime());
    });
    const maxEndIndex = Math.max(...eventEndIndexes);

    // Calculate horizontal positioning using the project start index.
    const leftOffset = projectStartIndex * cellWidth;
    const width = (maxEndIndex - projectStartIndex + 1) * cellWidth;

    return (
        <div
            className="relative w-full"
            // style={{ top: `${topOffset}px`, position: "absolute" }}
            style={{ top: `${topOffset}px` }}
        >
            {/* Template Header */}
            <Paper
                withBorder
                p={0}
                className="absolute bg-gray-100 shadow-md rounded-md flex items-center justify-center text-sm font-bold text-gray-800 cursor-pointer"
                style={{
                    left: `${leftOffset}px`,
                    width: `${width}px`,
                    height: `${headerHeight}px`,
                    lineHeight: `${headerHeight}px`,
                }}
                onClick={() => toggleTemplate(template.id)}
            >
                {template.name}
                {expanded ? (
                    <ChevronUp size={16} className="ml-1" />
                ) : (
                    <ChevronDown size={16} className="ml-1" />
                )}
            </Paper>

            {/* Render each event under the header if expanded */}
            {expanded && (
                <div className="relative w-full">
                    {events.map((event, eventIndex) => {
                        // Calculate start and end dates for the event.
                        const eventStartDate = new Date(projectStartDate);
                        eventStartDate.setDate(
                            eventStartDate.getDate() + event.offsetDays,
                        );
                        const eventEndDate = new Date(eventStartDate);
                        eventEndDate.setDate(
                            eventStartDate.getDate() + event.duration - 1,
                        );

                        const eventStartIndex = days.findIndex(
                            (d) =>
                                d.date.getTime() === eventStartDate.getTime(),
                        );
                        const eventEndIndex = days.findIndex(
                            (d) => d.date.getTime() === eventEndDate.getTime(),
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
                                name={event.name}
                                startIndex={eventStartIndex}
                                endIndex={eventEndIndex}
                                color="bg-blue-500"
                                cellWidth={cellWidth}
                                topOffset={eventTopOffset}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default TemplateRow;
