import DashboardClient from "@/app/components/dashboard/dashboardClient";
import { Day } from "@/app/components/dashboard/timeline";

const monthsData = [
    { value: "january", label: "January" },
    { value: "february", label: "February" },
    { value: "march", label: "March" },
    { value: "april", label: "April" },
    { value: "may", label: "May" },
    { value: "june", label: "June" },
    { value: "july", label: "July" },
    { value: "august", label: "August" },
    { value: "september", label: "September" },
    { value: "october", label: "October" },
    { value: "november", label: "November" },
    { value: "december", label: "December" },
];

function generateYearDays(year: number): Day[] {
    const days: Day[] = [];
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const dateIterator = new Date(startDate);
    while (dateIterator <= endDate) {
        const dayOfWeek = dateIterator.toLocaleDateString("en-US", {
            weekday: "short",
        });
        // label that uses the first letter of weekday + day number
        const label = `${dayOfWeek[0]}${dateIterator.getDate()}`;
        days.push({ date: new Date(dateIterator), label });
        dateIterator.setDate(dateIterator.getDate() + 1);
    }
    return days;
}

export default function Dashboard() {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const currentMonthIndex = currentDate.getMonth();
    const currentMonth = monthsData[currentMonthIndex].value;
    const days = generateYearDays(year);

    return (
        <>
            <DashboardClient
                months={monthsData}
                initialMonth={currentMonth}
                days={days}
                year={year}
            />
        </>
    );
}
