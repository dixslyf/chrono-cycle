"use client";

import { Modal, Text } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useRef, useState } from "react";

import DisplayEventDetails from "@/app/components/event/eventDetails";
import ProjectDetails from "@/app/components/project/projectDetails";
import { areSameDay } from "@/app/utils/dates";

import { Event, Project } from "@/common/data/domain";

import ProjectRow from "./projectRow";

export interface Day {
    date: Date;
    label: string;
}

interface TimelineProps {
    days: Day[];
    projects: Project[];
    selectedMonth: string;
    scrollToMonth?: string | null;
    onMonthChange?: (month: string) => void;
    onYearChange?: (year: number) => void;
    onScrolled?: () => void;
    onExtendDays?: (direction: "left" | "right") => void;
}

function Timeline({
    days,
    projects,
    scrollToMonth,
    onMonthChange,
    onYearChange,
    onExtendDays,
}: TimelineProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const cellWidth = 96; // fixed width for each day
    const headerHeight = 24; // height for project header
    const eventHeight = 32; // might be able to change this later on
    const rowSpacing = 4; // space between row

    const events = projects.map((p) => p.events).flat();

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
        // run only on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // adjust the scroll position when days are prepended
    const prevFirstDateRef = useRef<Date>(days[0]?.date || new Date());
    const prevDaysLengthRef = useRef<number>(days.length);
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        // if the new days array is longer and the new first day is earlier than the previous first day
        // then days were prepended
        if (
            days.length > prevDaysLengthRef.current &&
            days[0].date.getTime() < prevFirstDateRef.current.getTime()
        ) {
            // calculate how many days were added before the previous first date
            const diffDays = Math.round(
                (prevFirstDateRef.current.getTime() - days[0].date.getTime()) /
                    (24 * 3600 * 1000),
            );
            const offset = diffDays * cellWidth;
            container.scrollLeft = container.scrollLeft + offset;
        }
        prevFirstDateRef.current = days[0].date;
        prevDaysLengthRef.current = days.length;
    }, [days, cellWidth]);

    // update parent nav (month/year) and trigger infinite scroll when near container edges
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;
        const threshold = 200;

        const handleScroll = () => {
            const scrollLeft = container.scrollLeft;
            const containerWidth = container.offsetWidth;
            const centerPosition = scrollLeft + containerWidth / 2;
            const index = Math.floor(centerPosition / cellWidth);
            if (days[index]) {
                // const monthName = days[index].date.toLocaleDateString("en-US", {
                //     month: "long",
                // });
                // onMonthChange(monthName);
                if (onMonthChange) {
                    const monthName = days[index].date.toLocaleDateString(
                        "en-US",
                        { month: "long" },
                    );
                    onMonthChange(monthName);
                }
                if (onYearChange) {
                    const newYear = days[index].date.getFullYear();
                    onYearChange(newYear);
                }
            }
            // trigger infinite scroll extension
            if (onExtendDays) {
                if (scrollLeft < threshold) {
                    onExtendDays("left");
                }
                if (
                    scrollLeft + containerWidth >
                    container.scrollWidth - threshold
                ) {
                    onExtendDays("right");
                }
            }
        };

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, [days, cellWidth, onMonthChange, onExtendDays, onYearChange]);

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

    // States for showing event details in a modal window.
    const [clickedEvent, setClickedEvent] = useState<Event | null>(null);
    const [
        eventDetailsModalOpened,
        { open: openEventDetailsModal, close: closeEventDetailsModal },
    ] = useDisclosure(false);

    // States for showing project details in a modal window.
    const [clickedProject, setClickedProject] = useState<Project | null>(null);
    const [
        projectDetailsModalOpened,
        { open: openProjectDetailsModal, close: closeProjectDetailsModal },
    ] = useDisclosure(false);

    // each day is one column wide, so number of columns should be days.length
    return (
        <div
            ref={containerRef}
            className="overflow-x-auto w-full flex-1 h-full flex flex-col relative z-0"
        >
            <Modal
                opened={eventDetailsModalOpened}
                onClose={closeEventDetailsModal}
                title="Event Details"
            >
                {clickedEvent && <DisplayEventDetails event={clickedEvent} />}
            </Modal>
            <Modal
                opened={projectDetailsModalOpened}
                onClose={closeProjectDetailsModal}
                title="Project Details"
            >
                {clickedProject && <ProjectDetails project={clickedProject} />}
            </Modal>
            <div className="flex h-full flex-1 relative">
                {days.map((day, i) => {
                    // const isToday =
                    //     new Date().toDateString() === day.date.toDateString();
                    const isToday = areSameDay(new Date(), day.date);
                    return (
                        <div
                            // key={day.date.toISOString()}
                            key={`${day.date.toISOString()}-${i}`}
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
                                days={days}
                                cellWidth={cellWidth}
                                eventHeight={eventHeight}
                                rowSpacing={rowSpacing}
                                expanded={!!expandedProjects[project.id]}
                                onProjectClick={(project) => {
                                    setClickedProject(project);
                                    openProjectDetailsModal();
                                }}
                                toggleProject={toggleProject}
                                topOffset={topOffset}
                                headerHeight={headerHeight}
                                onEventClick={(event) => {
                                    setClickedEvent(event);
                                    openEventDetailsModal();
                                }}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

export default Timeline;
