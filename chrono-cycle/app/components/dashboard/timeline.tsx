"use client";
import { useEffect, useRef, useState } from "react";
import { Text, Button, Accordion, Paper } from "@mantine/core";
import { ChevronUp, ChevronDown } from "lucide-react";
import EventBar from "./eventBar";

export interface Day {
    date: Date;
    label: string;
}

export interface Event {
    id: string;
    projectId: string;
    name: string;
    offsetDays: number;
    duration: number;
    eventType: "task" | "activity";
    eventTemplateId: string | null;
    status: "none" | "not started" | "in progress" | "completed";
}

export interface EventTemplate {
    id: string;
    name: string;
}

interface TimelineProps {
    days: Day[];
    events: Event[];
    eventTemplates: EventTemplate[];
    projectStartDate: Date;
    selectedMonth: string;
    scrollToMonth?: string | null;
    onMonthChange?: (month: string) => void;
    onScrolled?: () => void;
}

function Timeline({
    days,
    events,
    eventTemplates,
    projectStartDate,
    scrollToMonth,
    onMonthChange,
}: TimelineProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const cellWidth = 96; // fixed width for each day
    const eventHeight = 32; // might be able to change this later on
    const rowSpacing = 4; // space between row

    // Group event based on templateid
    const eventMap = new Map<string, Event[]>();
    events.forEach((event) => {
        if (!event.eventTemplateId) return; // skip event without template
        if (!eventMap.has(event.eventTemplateId)) {
            eventMap.set(event.eventTemplateId, []);
        }
        eventMap.get(event.eventTemplateId)!.push(event);
    });

    // toggle state for each template
    const [expandedTemplates, setExpandedTemplates] = useState<
        Record<string, boolean>
    >({});

    const toggleTemplate = (templateID: string) => {
        setExpandedTemplates((prev) => ({
            ...prev,
            [templateID]: !prev[templateID],
        }));
    };

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        // scroll to the current day
        const todayIndex = days.findIndex(
            (d) => new Date().toDateString() === d.date.toDateString(),
        );
        if (todayIndex !== -1) {
            const containerWidth = container.offsetWidth;
            const scrollLeft = Math.max(
                0,
                todayIndex * cellWidth - containerWidth / 2 + cellWidth / 2,
            );
            container.scrollLeft = scrollLeft;
        }
    }, [days, cellWidth]);

    // update the parent nav when scrolling
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !onMonthChange) return;

        const handleScroll = () => {
            const scrollLeft = container.scrollLeft;
            const containerWidth = container.offsetWidth;
            const centerPosition = scrollLeft + containerWidth / 2;
            const index = Math.floor(centerPosition / cellWidth);
            if (days[index]) {
                const monthName = days[index].date.toLocaleDateString("en-US", {
                    month: "long",
                });
                onMonthChange(monthName);
            }
        };
        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, [days, cellWidth, onMonthChange]);

    useEffect(() => {
        if (!scrollToMonth) return;
        const container = containerRef.current;
        if (!container) return;

        // find the infdex of the frist day with matching month
        const targetIndex = days.findIndex((day) => {
            const monthName = day.date.toLocaleDateString("en-US", {
                month: "long",
            });
            return monthName.toLowerCase() === scrollToMonth;
        });

        if (targetIndex !== -1) {
            const containerWidth = container.offsetWidth;
            const scrollLeft = Math.max(
                0,
                targetIndex * cellWidth - containerWidth / 2 + cellWidth / 2,
            );
            container.scrollLeft = scrollLeft;
            if (typeof onMonthChange === "function") {
                const newMonth = days[targetIndex].date.toLocaleDateString(
                    "en-US",
                    {
                        month: "long",
                    },
                );
                onMonthChange(newMonth);
            }
        }
        // this line is required to ignore the missing onMonthChange dep
        // since this should only run when `scrollToMonth` changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scrollToMonth, days, cellWidth]);

    // each day is one column wide, so number of columns should be days.length
    return (
        <div
            ref={containerRef}
            className="overflow-x-auto w-full flex-1 h-full flex flex-col relative"
        >
            <div className="flex h-full flex-1 relative">
                {days.map((day) => {
                    const isToday =
                        new Date().toDateString() === day.date.toDateString();
                    return (
                        <div
                            key={day.date.toISOString()}
                            className="flex-none border p-2 text-center flex flex-col gap-2"
                            style={{ width: `${cellWidth}px` }}
                        >
                            <Text
                                className={
                                    isToday
                                        ? "font-bold text-palette3 bg-palette2"
                                        : ""
                                }
                            >
                                {day.label}
                            </Text>
                            {/* vertical line below label */}
                            <div
                                className={`w-[0.1rem] h-[90%] mx-auto mt-2 ${
                                    // isToday ? "bg-palette2" : "bg-gray-700"
                                    isToday
                                        ? "bg-palette2"
                                        : day.date < new Date()
                                          ? "bg-gray-300"
                                          : "bg-gray-700"
                                }`}
                            />
                        </div>
                    );
                })}

                {/* Render Events */}
                <div className="absolute top-16 w-full">
                    {(() => {
                        const occupiedRows: number[][] = [];
                        return eventTemplates.map((template) => {
                            const templateEvents =
                                eventMap.get(template.id) || [];

                            if (templateEvents.length === 0) return null; // Skip empty templates

                            // set template start index to project start date
                            const startIndex = days.findIndex(
                                (d) =>
                                    d.date.toDateString() ===
                                    projectStartDate.toDateString(),
                            );

                            // set template end index to last event's end date
                            const endIndex = Math.max(
                                ...templateEvents.map((event) =>
                                    days.findIndex(
                                        (d) =>
                                            d.date.toDateString() ===
                                            new Date(
                                                projectStartDate.getTime() +
                                                    (event.offsetDays +
                                                        event.duration -
                                                        1) *
                                                        86400000,
                                            ).toDateString(),
                                    ),
                                ),
                            );

                            if (startIndex === -1 || endIndex === -1)
                                return null; // Skip if no valid events

                            /** Calculate leftOffset and width like EventBar */
                            const leftOffset = startIndex * cellWidth;
                            const width =
                                (endIndex - startIndex + 1) * cellWidth;

                            /** Find the lowest available row for this template */
                            let row = 0;
                            while (occupiedRows[row]) {
                                row++;
                            }

                            // Mark row as occupied for this template
                            occupiedRows[row] = [];

                            return (
                                <div
                                    key={template.id}
                                    className="relative w-full"
                                >
                                    {/* Template Header (Aligned to its row) */}
                                    <Paper
                                        withBorder
                                        p="sm"
                                        className="absolute bg-gray-100 shadow-md rounded-md flex items-center justify-center text-sm font-bold text-gray-800"
                                        style={{
                                            left: `${leftOffset}px`,
                                            width: `${width}px`,
                                            height: "24px",
                                            top: `${row * (eventHeight + rowSpacing)}px`,
                                        }}
                                        onClick={() =>
                                            toggleTemplate(template.id)
                                        }
                                    >
                                        {template.name}
                                        {expandedTemplates[template.id] ? (
                                            <ChevronUp size={16} />
                                        ) : (
                                            <ChevronDown size={16} />
                                        )}
                                    </Paper>

                                    {/* Render Events under the template */}
                                    {expandedTemplates[template.id] && (
                                        <div className="relative w-full">
                                            {(() => {
                                                return templateEvents.map(
                                                    (event, eventIndex) => {
                                                        const startDate =
                                                            new Date(
                                                                projectStartDate,
                                                            );
                                                        startDate.setDate(
                                                            startDate.getDate() +
                                                                event.offsetDays,
                                                        );

                                                        const endDate =
                                                            new Date(startDate);
                                                        endDate.setDate(
                                                            startDate.getDate() +
                                                                event.duration -
                                                                1,
                                                        );

                                                        const startIndex =
                                                            days.findIndex(
                                                                (d) =>
                                                                    d.date.toDateString() ===
                                                                    startDate.toDateString(),
                                                            );

                                                        const endIndex =
                                                            days.findIndex(
                                                                (d) =>
                                                                    d.date.toDateString() ===
                                                                    endDate.toDateString(),
                                                            );

                                                        if (
                                                            startIndex !== -1 &&
                                                            endIndex !== -1
                                                        ) {
                                                            let eventRow =
                                                                row + 1; // Place events **below** template
                                                            while (
                                                                occupiedRows[
                                                                    eventRow
                                                                ] &&
                                                                occupiedRows[
                                                                    eventRow
                                                                ].some(
                                                                    (index) =>
                                                                        index >=
                                                                            startIndex &&
                                                                        index <=
                                                                            endIndex,
                                                                )
                                                            ) {
                                                                eventRow++;
                                                            }

                                                            if (
                                                                !occupiedRows[
                                                                    eventRow
                                                                ]
                                                            )
                                                                occupiedRows[
                                                                    eventRow
                                                                ] = [];
                                                            for (
                                                                let i =
                                                                    startIndex;
                                                                i <= endIndex;
                                                                i++
                                                            ) {
                                                                occupiedRows[
                                                                    eventRow
                                                                ].push(i);
                                                            }

                                                            return (
                                                                <EventBar
                                                                    key={
                                                                        eventIndex
                                                                    }
                                                                    name={
                                                                        event.name
                                                                    }
                                                                    startIndex={
                                                                        startIndex
                                                                    }
                                                                    endIndex={
                                                                        endIndex
                                                                    }
                                                                    color="bg-blue-500"
                                                                    cellWidth={
                                                                        cellWidth
                                                                    }
                                                                    topOffset={
                                                                        eventRow *
                                                                        (eventHeight +
                                                                            rowSpacing)
                                                                    }
                                                                />
                                                            );
                                                        }
                                                        return null;
                                                    },
                                                );
                                            })()}
                                        </div>
                                    )}
                                </div>
                            );
                        });
                    })()}
                </div>
            </div>
        </div>
    );
}

export default Timeline;
