"use client";
import { useState } from "react";
import DashNav from "./dashNav";
import Timeline, { Day, Event } from "./timeline";

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

    const projectStartDate = new Date(2025, 2, 1); // March 1 2025

    const [events, setEvents] = useState<Event[]>([
        { name: "Plant Seeds", offsetDays: 5, duration: 6, eventType: "task" },
        {
            name: "Harvest Apple",
            offsetDays: 8,
            duration: 7,
            eventType: "activity",
        },
    ]);

    // update the month from the nav from scrolling
    const handleSelectMonth = (month: string, scroll: boolean = false) => {
        setScrollToMonth(month);
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
                        projectStartDate={projectStartDate}
                        selectedMonth={selectedMonth}
                        scrollToMonth={scrollToMonth}
                        onMonthChange={(month) => {
                            setSelectedMonth(month.toLowerCase());
                        }}
                        onScolled={() => setScrollToMonth(null)}
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
