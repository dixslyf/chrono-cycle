"use client";
import { useState } from "react";
import DashNav from "./dashNav";
import Timeline, { Day, Event } from "./timeline";
import { EventTemplate } from "./timeline"; // should change this

interface DashboardProps {
    months: { value: string; label: string }[];
    initialMonth: string;
    days: Day[];
    year: number;
}

function DashboardClient({ months, initialMonth, days, year }: DashboardProps) {
    const [selectedMonth, setSelectedMonth] = useState(initialMonth);
    const [scrollToMonth, setScrollToMonth] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<"timeline" | "calendar">(
        "timeline",
    );

    const projectStartDate = new Date(2025, 2, 7); // March 7 2025

    // TODO
    // should change this in the backend
    // define event templates
    const [project, setProject] = useState<EventTemplate[]>([
        { id: "template-1", name: "Gardening Tasks" },
        { id: "template-2", name: "Harvesting Schedule" },
    ]);

    const [events, setEvents] = useState<Event[]>([
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
                        eventTemplates={project}
                        projectStartDate={projectStartDate}
                        selectedMonth={selectedMonth}
                        scrollToMonth={scrollToMonth}
                        onMonthChange={(month) => {
                            setSelectedMonth(month.toLowerCase());
                        }}
                        onScrolled={() => setScrollToMonth(null)}
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
