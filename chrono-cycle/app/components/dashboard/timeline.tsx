"use client";
import { useEffect, useRef, useState } from "react";
import { Text } from "@mantine/core";
import ProjectRow from "./projectRow";

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

export interface Project {
    id: string;
    name: string;
}

interface TimelineProps {
    days: Day[];
    events: Event[];
    projects: Project[];
    projectStartDate: Date;
    selectedMonth: string;
    scrollToMonth?: string | null;
    onMonthChange?: (month: string) => void;
    onScrolled?: () => void;
}

function Timeline({
    days,
    events,
    projects,
    projectStartDate,
    scrollToMonth,
    onMonthChange,
}: TimelineProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const cellWidth = 96; // fixed width for each day
    const headerHeight = 24; // height for project header
    const eventHeight = 32; // might be able to change this later on
    const rowSpacing = 4; // space between row

    // Group event based on project ID
    const eventMap = new Map<string, Event[]>();
    events.forEach((event) => {
        if (!event.projectId) return; // skip event without project
        if (!eventMap.has(event.projectId)) {
            eventMap.set(event.projectId, []);
        }
        eventMap.get(event.projectId)!.push(event);
    });

    // toggle state for each project
    const [expandedProjects, setExpandedProjects] = useState<
        Record<string, boolean>
    >({});

    const toggleProject = (projectId: string) => {
        setExpandedProjects((prev) => ({
            ...prev,
            [projectId]: !prev[projectId],
        }));
    };

    // scroll to current day on initial load
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

    // scroll to a specific month when the scrollToMonth prop changes
    useEffect(() => {
        if (!scrollToMonth) return;
        const container = containerRef.current;
        if (!container) return;

        // find the index of the first day with matching month
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

    // calculate a cumulative vertical offset for each project row.
    // each row's height is the header height plus additionnal height for expanded events.
    let cumulativeOffset = 0;

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
                {/* render project row with events */}
                <div className="absolute top-16 w-full">
                    {projects.map((project) => {
                        const projectEvents = eventMap.get(project.id) || [];
                        if (projectEvents.length === 0) return null;

                        // determine the current project's top offset
                        const topOffset = cumulativeOffset;

                        // determine additional height if expanded:
                        const isExpanded = !!expandedProjects[project.id];
                        const extraHeight = isExpanded
                            ? projectEvents.length * (eventHeight + rowSpacing)
                            : 0;

                        // updated cumulative offset: header height + extra height + rowspacing for gap
                        cumulativeOffset +=
                            headerHeight + extraHeight + rowSpacing;

                        return (
                            <ProjectRow
                                key={project.id}
                                project={project}
                                events={projectEvents}
                                days={days}
                                projectStartDate={projectStartDate}
                                cellWidth={cellWidth}
                                eventHeight={eventHeight}
                                rowSpacing={rowSpacing}
                                expanded={!!expandedProjects[project.id]}
                                toggleProject={toggleProject}
                                topOffset={topOffset}
                                headerHeight={headerHeight}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Timeline;
