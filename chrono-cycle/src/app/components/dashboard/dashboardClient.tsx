"use client";

import { LoadingOverlay } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { useState } from "react";

import { queryKeys } from "@/app/utils/queries/keys";

import { Project } from "@/common/data/domain";
import { Day, generateDaysInRange } from "@/common/dates";

import { listAllProjectsAction } from "@/features/projects/listAll/action";

import DashNav from "./dashNav";
import Timeline from "./timeline";

interface DashboardProps {
    initialDays: Day[];
    initialMonth: string;
    year: number;
    months: { value: string; label: string }[];
}

function DashboardClient({
    initialDays,
    initialMonth,
    year,
    months,
}: DashboardProps) {
    const projectsQuery = useQuery({
        queryKey: queryKeys.projects.listAll(),
        queryFn: async (): Promise<Project[]> => {
            const result = await listAllProjectsAction();
            return pipe(
                result,
                E.getOrElseW((err) => {
                    throw err;
                }),
            );
        },
        meta: {
            errorMessage: "Failed to retrieve project data.",
        },
    });

    const [days, setDays] = useState<Day[]>(initialDays);
    const [selectedMonth, setSelectedMonth] = useState(initialMonth);
    const [currentYear, setCurrentYear] = useState(year);
    const [scrollToMonth, setScrollToMonth] = useState<string | null>(null);
    const [scrollToToday, setScrollToToday] = useState(false);

    // extend the days array when the user scrolls
    const extendDays = (direction: "left" | "right") => {
        if (direction === "left") {
            const firstDate = days[0].date;
            const newStart = new Date(firstDate);
            newStart.setMonth(newStart.getMonth() - 1);
            const newEnd = new Date(firstDate.getTime() - 24 * 3600 * 1000); // day before current first date
            const newDays = generateDaysInRange(newStart, newEnd);
            setDays((prevDays) => [...newDays, ...prevDays]);
        } else if (direction === "right") {
            const lastDate = days[days.length - 1].date;
            const newEnd = new Date(lastDate);
            newEnd.setMonth(newEnd.getMonth() + 1);
            const newStart = new Date(lastDate.getTime() + 24 * 3600 * 1000); // day after current last date
            const newDays = generateDaysInRange(newStart, newEnd);
            setDays((prevDays) => [...prevDays, ...newDays]);
        }
    };

    // update the month from the nav from scrolling
    const handleSelectMonth = (month: string, scroll: boolean = false) => {
        if (scroll) {
            setScrollToMonth(month);
        }
    };

    return (
        <div className="flex flex-col flex-1 relative">
            <LoadingOverlay
                visible={projectsQuery.isFetching}
                zIndex={300}
                overlayProps={{ blur: 2 }}
            />
            <div className="flex flex-col flex-1 h-full">
                <DashNav
                    months={months}
                    selectedMonth={selectedMonth}
                    onSelectMonth={(month) => handleSelectMonth(month, true)}
                    year={currentYear}
                    onTodayClick={() => setScrollToToday(true)}
                />
                <Timeline
                    days={days}
                    projects={projectsQuery.data ?? []}
                    selectedMonth={selectedMonth}
                    scrollToMonth={scrollToMonth}
                    scrollToToday={scrollToToday}
                    onMonthChange={(month) => {
                        setSelectedMonth(month.toLowerCase());
                    }}
                    onYearChange={(year) => {
                        setCurrentYear(year);
                    }}
                    onScrolled={() => setScrollToToday(false)}
                    onExtendDays={extendDays}
                />
            </div>
        </div>
    );
}

export default DashboardClient;
