"use client";

import { Box, Group, Modal, Stack, Text, useModalsStack } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as O from "fp-ts/Option";
import { useEffect, useRef, useState } from "react";

import { SplitModal } from "@/app/components/customComponent/splitModal";
import {
    DisplayEventDetailsLeft,
    DisplayEventDetailsRight,
} from "@/app/components/event/eventDetails";
import { ProjectDetailsModal } from "@/app/components/project/projectDetails";
import { areSameDay } from "@/app/utils/dates";
import { queryKeys } from "@/app/utils/queries/keys";

import { Event, Project } from "@/common/data/domain";

import { retrieveProjectTemplateAction } from "@/features/project-templates/retrieve/action";

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

    const modalStack = useModalsStack([
        "project-details",
        "event-details",
        "confirm-delete-project",
    ]);

    // States for showing event details in a modal window.
    const [clickedEvent, setClickedEvent] = useState<Event | null>(null);

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
        >
            <Modal.Stack>
                <SplitModal {...modalStack.register("event-details")}>
                    {clickedEvent && (
                        <>
                            <SplitModal.Left title={`${clickedEvent.name}`}>
                                <DisplayEventDetailsLeft event={clickedEvent} />
                            </SplitModal.Left>
                            <SplitModal.Right>
                                <DisplayEventDetailsRight
                                    event={clickedEvent}
                                />
                            </SplitModal.Right>
                        </>
                    )}
                </SplitModal>
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
                    return (
                        <Stack
                            key={`${day.date.toISOString()}-${i}`}
                            // className="flex-none border p-2 text-center flex flex-col gap-2"
                            className="absolute top-0 bottom-0 border p-2 text-center gap-2"
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
                                    setClickedEvent(event);
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
