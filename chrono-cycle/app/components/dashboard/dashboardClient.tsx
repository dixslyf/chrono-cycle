"use client";
import { useState } from "react";
import DashNav from "./dashNav";
import Timeline, { Day } from "./timeline";

interface DashboardProps {
    months: { value: string; label: string }[];
    initialMonth: string;
    days: Day[];
    year: number;
}

function DashboardClient({ months, initialMonth, days, year }: DashboardProps) {
    const [selectedMonth, setSelectedMonth] = useState(initialMonth);
    const [scrollToMonth, setScrollToMonth] = useState<string | null>(null);

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
                />
                <Timeline
                    days={days}
                    selectedMonth={selectedMonth}
                    scrollToMonth={scrollToMonth}
                    onMonthChange={(month) => {
                        setSelectedMonth(month.toLowerCase());
                    }}
                    onScolled={() => setScrollToMonth(null)}
                />
            </div>
        </>
    );
}

export default DashboardClient;
