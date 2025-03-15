"use client";

import { useState } from "react";

import { generateDaysInRange } from "@/app/utils/dates";

import DashNav from "./dashNav";
import Timeline, { Day, Event, Project } from "./timeline";

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
    const [days, setDays] = useState<Day[]>(initialDays);
    const [selectedMonth, setSelectedMonth] = useState(initialMonth);
    const [scrollToMonth, setScrollToMonth] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<"timeline" | "calendar">(
        "timeline",
    );

    const projectStartDate = new Date(2025, 2, 7); // March 7 2025

    // TODO
    // should change this in the backend
    const [projects, _setProjects] = useState<Project[]>([
        { id: "project-1", name: "Gardening Tasks" },
        { id: "project-2", name: "Harvesting Schedule" },
    ]);

    const [events, _setEvents] = useState<Event[]>([
        {
            id: "event-1",
            projectId: "project-1",
            name: "Plant Seeds",
            offsetDays: 5,
            duration: 6,
            eventType: "task",
            eventTemplateId: "template-1",
            status: "not started",
        },
        {
            id: "event-2",
            projectId: "project-2",
            name: "Harvest Apple",
            offsetDays: 8,
            duration: 7,
            eventType: "activity",
            eventTemplateId: "template-2",
            status: "in progress",
        },
    ]);

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
        // setScrollToMonth(month);
        if (scroll) {
            setScrollToMonth(month);
        }
    };

    return (
        <>
            <div className="flex flex-col flex-1 h-full">
                <DashNav
                    months={months}
                    selectedMonth={selectedMonth}
                    onSelectMonth={(month) => handleSelectMonth(month, true)}
                    year={year}
                    activeView={activeView}
                    onViewChange={setActiveView}
                />
                {activeView === "timeline" ? (
                    <Timeline
                        days={days}
                        events={events}
                        projects={projects}
                        projectStartDate={projectStartDate}
                        selectedMonth={selectedMonth}
                        scrollToMonth={scrollToMonth}
                        onMonthChange={(month) => {
                            setSelectedMonth(month.toLowerCase());
                        }}
                        onScrolled={() => setScrollToMonth(null)}
                        onExtendDays={extendDays}
                    />
                ) : (
                    <div className="flex flex-1 items-center justify-center">
                        <h2>Calendar view</h2>
                    </div>
                )}
            </div>
        </>
    );
}

export default DashboardClient;
