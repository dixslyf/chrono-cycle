"use client";
import { useEffect, useRef } from "react";
import { Text } from "@mantine/core";
import EventBar from "./eventBar";

export interface Day {
    date: Date;
    label: string;
}

export type Event = {
    name: string;
    offsetDays: number;
    duration: number;
    eventType: "task" | "activity";
};

interface TimelineProps {
    days: Day[];
    events: Event[];
    projectStartDate: Date;
    selectedMonth: string;
    scrollToMonth?: string | null;
    onMonthChange?: (month: string) => void;
    onScolled?: () => void;
}

function Timeline({
    days,
    events,
    projectStartDate,
    scrollToMonth,
    onMonthChange,
}: TimelineProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const cellWidth = 96; // fixed width for each day
    const eventHeight = 32; // might be able to change this later on
    const rowSpacing = 4; // space between row

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
                        return events?.map((event, eventIndex) => {
                            // get event start and end dates based on project start date
                            const startDate = new Date(projectStartDate);
                            startDate.setDate(
                                startDate.getDate() + event.offsetDays,
                            );

                            const endDate = new Date(startDate);
                            endDate.setDate(
                                startDate.getDate() + event.duration - 1,
                            );

                            // find index based on days
                            const startIndex = days.findIndex(
                                (d) =>
                                    d.date.toDateString() ===
                                    startDate.toDateString(),
                            );
                            const endIndex = days.findIndex(
                                (d) =>
                                    d.date.toDateString() ===
                                    endDate.toDateString(),
                            );

                            if (startIndex !== -1 && endIndex !== -1) {
                                // find the lowest avaliable row slot
                                let row = 0;
                                while (
                                    occupiedRows[row] &&
                                    occupiedRows[row].some(
                                        (index) =>
                                            index >= startIndex &&
                                            index <= endIndex,
                                    )
                                ) {
                                    row++;
                                }

                                // mark these days as occupied for this row
                                if (!occupiedRows[row]) occupiedRows[row] = [];
                                for (let i = startIndex; i <= endIndex; i++) {
                                    occupiedRows[row].push(i);
                                }

                                return (
                                    <EventBar
                                        key={eventIndex}
                                        name={event.name}
                                        startIndex={startIndex}
                                        endIndex={endIndex}
                                        color="bg-blue-500"
                                        cellWidth={cellWidth}
                                        topOffset={
                                            row * (eventHeight + rowSpacing)
                                        }
                                    />
                                );
                            }

                            return null;
                        });
                    })()}
                    {/* {events.map((event, evnetIndex) => {
                        const startDate = new Date(projectStartDate);
                        startDate.setDate(
                            startDate.getDate() + event.offsetDays,
                        );

                        const endDate = new Date(startDate);
                        endDate.setDate(
                            startDate.getDate() + event.duration - 1,
                        );

                        // find index in days
                        const startIndex = days.findIndex(
                            (d) =>
                                d.date.toDateString() ===
                                startDate.toDateString(),
                        );
                        const endIndex = days.findIndex(
                            (d) =>
                                d.date.toDateString() ===
                                endDate.toDateString(),
                        );

                        if (startIndex !== -1 && endIndex !== -1) {
                            return (
                                <EventBar
                                    key={evnetIndex}
                                    name={event.name}
                                    startIndex={startIndex}
                                    endIndex={endIndex}
                                    color={"blue"} // not sure about this
                                    cellWidth={cellWidth}
                                />
                            );
                        }

                        return null;
                    })} */}
                </div>
            </div>
        </div>
    );
}

export default Timeline;
