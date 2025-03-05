"use client";
import { useEffect, useRef } from "react";
import { Text } from "@mantine/core";

export interface Day {
    date: Date;
    label: string;
}

interface TimelineProps {
    days: Day[];
    onMonthChange?: (month: string) => void;
}

function Timeline({ days, onMonthChange }: TimelineProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const cellWidth = 96; // fixed width for each day

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

    // each day is one column wide, so number of columns should be days.length
    return (
        <div ref={containerRef} className="overflow-x-auto">
            <div className="flex">
                {days.map((day) => {
                    const isToday =
                        new Date().toDateString() === day.date.toDateString();
                    return (
                        <div
                            key={day.date.toISOString()}
                            className="flex-none border p-2 text-center"
                            style={{ width: `${cellWidth}px` }}
                        >
                            <Text
                                className={
                                    isToday ? "font-bold text-yellow-500" : ""
                                }
                            >
                                {day.label}
                            </Text>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Timeline;
