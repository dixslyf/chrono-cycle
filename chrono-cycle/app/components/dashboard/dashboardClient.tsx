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

    return (
        <>
            <div className="flex flex-col flex-1 h-full">
                <DashNav
                    months={months}
                    selectedMonth={selectedMonth}
                    onSelectMonth={setSelectedMonth}
                    year={year}
                />
                <Timeline
                    days={days}
                    onMonthChange={(month) =>
                        setSelectedMonth(month.toLowerCase())
                    }
                />
            </div>
        </>
    );
}

export default DashboardClient;
