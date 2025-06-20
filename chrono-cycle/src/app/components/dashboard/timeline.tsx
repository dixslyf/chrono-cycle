"use client";

import { Box, Group, Modal, Stack, Text, useModalsStack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import { useEffect, useRef, useState } from "react";

import { EventDetailsModal } from "@/app/components/event/eventDetails";
import { ProjectDetailsModal } from "@/app/components/project/projectDetails";
import { queryKeys } from "@/app/utils/queries/keys";

import { Event, Project } from "@/common/data/domain";
import { areSameDay, Day } from "@/common/dates";

import { retrieveProjectTemplateAction } from "@/features/project-templates/retrieve/action";

import ProjectRow from "./projectRow";

type MonthKey =
    | "january"
    | "february"
    | "march"
    | "april"
    | "may"
    | "june"
    | "july"
    | "august"
    | "september"
    | "october"
    | "november"
    | "december";

const monthNames: Record<MonthKey, number> = {
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    may: 4,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11,
};

interface TimelineProps {
    days: Day[];
    projects: Project[];
    selectedMonth: string;
    scrollToMonth?: string | null;
    scrollToToday?: boolean;
    onMonthChange?: (month: string) => void;
    onYearChange?: (year: number) => void;
    onScrolled?: () => void;
    onExtendDays?: (direction: "left" | "right") => void;
}

function Timeline({
    days,
    projects,
    scrollToMonth,
    scrollToToday,
    onMonthChange,
    onYearChange,
    onScrolled,
    onExtendDays,
}: TimelineProps) {
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const cellWidth = 96; // fixed width for each day

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

    // scroll to today if today button is clicked
    useEffect(() => {
        if (!scrollToToday) return;
        const container = containerRef.current;
        if (!container) return;

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
            if (onScrolled) {
                onScrolled();
            }
        }
    }, [scrollToToday, days, cellWidth, onScrolled]);

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

        const targetMonthNumber =
            monthNames[scrollToMonth.toLowerCase() as MonthKey];
        if (targetMonthNumber === undefined) return;

        const targetIndex = days.findIndex(
            (day) => day.date.getMonth() === targetMonthNumber,
        );

        if (targetIndex === -1 && onExtendDays) {
            const firstDay = days[0].date;
            const lastDay = days[days.length - 1].date;

            if (targetMonthNumber < firstDay.getMonth()) {
                onExtendDays("left");
            } else if (targetMonthNumber > lastDay.getMonth()) {
                onExtendDays("right");
            }
            return;
        }

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

    // click and drag function
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        let isDown = false;
        let startX = 0;
        let scrollLeft = 0;

        const handleMouseDown = (e: MouseEvent) => {
            isDown = true;
            // container.classList.add("dragging");
            setIsDragging(true);
            startX = e.pageX - container.offsetLeft;
            scrollLeft = container.scrollLeft;
        };

        const handleMouseLeave = () => {
            isDown = false;
            // container.classList.remove("dragging");
            setIsDragging(false);
        };

        const handleMouseUp = () => {
            isDown = false;
            // container.classList.remove("dragging");
            setIsDragging(false);
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - container.offsetLeft;
            const walk = (x - startX) * 1;
            container.scrollLeft = scrollLeft - walk;
        };

        container.addEventListener("mousedown", handleMouseDown);
        container.addEventListener("mouseleave", handleMouseLeave);
        container.addEventListener("mouseup", handleMouseUp);
        container.addEventListener("mousemove", handleMouseMove);

        return () => {
            container.removeEventListener("mousedown", handleMouseDown);
            container.removeEventListener("mouseleave", handleMouseLeave);
            container.removeEventListener("mouseup", handleMouseUp);
            container.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    // calculate a cumulative vertical offset for each project row.
    // each row's height is the header height plus additionnal height for expanded events.

    const modalStack = useModalsStack([
        "project-details",
        "event-details",
        "confirm-delete-project",
    ]);

    // States for showing event details in a modal window.
    const [clickedEventData, setClickedEventData] = useState<{
        eventId: string;
        projectId: string;
    } | null>(null);

    // To always have the latest event data, we find the clicked event from the projects list
    // because that list always reflects the latest data (due to the Tanstack Query).
    const clickedEventProject = clickedEventData
        ? (projects.find((p) => p.id === clickedEventData.projectId) as Project)
        : null;
    const clickedEvent =
        clickedEventProject && clickedEventData
            ? (clickedEventProject.events.find(
                  (e) => e.id === clickedEventData.eventId,
              ) as Event)
            : null;

    // States for showing project details in a modal window.
    const [clickedProject, setClickedProject] = useState<Project | null>(null);
    const retrieveProjectTemplateQuery = useQuery({
        queryKey: queryKeys.projects.retrieveProjectTemplate(
            clickedProject?.id ?? null,
        ),
        queryFn: async () => {
            // Type cast. Guaranteed to not be null since this query is only enabled
            // when it is set.
            const clickedProj = clickedProject as Project;

            // No project template (i.e., the project template has been deleted).
            if (clickedProj.projectTemplateId === null) {
                return O.none;
            }

            const result = await retrieveProjectTemplateAction({
                projectTemplateId: clickedProj.projectTemplateId,
            });
            return pipe(
                result,
                E.getOrElseW((err) => {
                    // To trigger error notification from Tanstack query.
                    throw err;
                }),
                O.some,
            );
        },
        enabled: Boolean(clickedProject),
        meta: {
            errorMessage:
                "Failed to retrieve project's project template information.",
            onError: () => modalStack.close("project-details"),
        },
    });

    // each day is one column wide, so number of columns should be days.length
    return (
        <Stack
            ref={containerRef}
            className="overflow-x-auto w-full flex-1 h-full relative z-0"
            style={{ cursor: isDragging ? "grabbing" : "auto" }}
        >
            <Modal.Stack>
                <EventDetailsModal
                    modalStack={modalStack}
                    event={clickedEvent ?? undefined}
                />
                {/* project details modal */}
                <ProjectDetailsModal
                    modalStack={modalStack}
                    project={clickedProject ?? undefined}
                    projectTemplate={retrieveProjectTemplateQuery.data}
                    isLoading={retrieveProjectTemplateQuery.isPending}
                />
            </Modal.Stack>
            <Group className="h-full flex-1 relative" align="stretch">
                {days.map((day, i) => {
                    const isToday = areSameDay(new Date(), day.date);
                    const isFirstDayOfMonth = day.date.getDate() === 1;
                    const lastDayOfMonth = new Date(
                        day.date.getFullYear(),
                        day.date.getMonth() + 1,
                        0,
                    ).getDate();
                    const isLastOfMonth = day.date.getDate() === lastDayOfMonth;
                    return (
                        <Stack
                            key={`${day.date.toISOString()}-${i}`}
                            // className="absolute top-0 bottom-0 border p-2 text-center gap-2"
                            className={`absolute top-0 bottom-0 border p-2 text-center gap-2
                                ${isFirstDayOfMonth ? "border-l-2 border-l-black" : ""}
                                ${isLastOfMonth ? "border-r-2 border-r-black" : ""}
                                `}
                            style={{
                                width: `${cellWidth}px`,
                                left: `${i * cellWidth}px`,
                            }}
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
                            <Box
                                className={`w-[0.1rem] h-[95%] mx-auto mt-2 ${
                                    isToday
                                        ? "bg-palette2"
                                        : day.date < new Date()
                                          ? "bg-gray-300"
                                          : "bg-gray-700"
                                }`}
                            />
                        </Stack>
                    );
                })}
                {/* render project row with events */}
                <Stack className="my-12 flex-nowrap">
                    {projects.map((project) => {
                        const projectEvents = eventMap.get(project.id) || [];
                        if (projectEvents.length === 0) return null;
                        return (
                            <ProjectRow
                                key={project.id}
                                project={project}
                                days={days}
                                cellWidth={cellWidth}
                                expanded={!!expandedProjects[project.id]}
                                onProjectClick={(project) => {
                                    setClickedProject(project);
                                    modalStack.open("project-details");
                                }}
                                toggleProject={toggleProject}
                                onEventClick={(event) => {
                                    setClickedEventData({
                                        eventId: event.id,
                                        projectId: event.projectId,
                                    });
                                    modalStack.open("event-details");
                                }}
                            />
                        );
                    })}
                </Stack>
            </Group>
        </Stack>
    );
}

export default Timeline;
