import DashboardClient from "@/app/components/dashboard/dashboardClient";
import { generateDaysInRange } from "@/app/utils/dates";

function getDynamicDateRange(
    referenceDate: Date,
    monthsBefore = 3,
    monthsAfter = 3,
) {
    const start = new Date(referenceDate);
    const end = new Date(referenceDate);
    start.setMonth(start.getMonth() - monthsBefore);
    end.setMonth(end.getMonth() + monthsAfter);
    return { start, end };
}

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

export default function Dashboard() {
    const currentDate = new Date();
    const { start, end } = getDynamicDateRange(currentDate, 3, 3);
    const initialDays = generateDaysInRange(start, end);
    const currentMonth = currentDate
        .toLocaleDateString("en-US", { month: "long" })
        .toLocaleLowerCase();
    const year = currentDate.getFullYear();

    return (
        <>
            <DashboardClient
                initialDays={initialDays}
                initialMonth={currentMonth}
                year={year}
                months={monthsData}
            />
        </>
    );
}
