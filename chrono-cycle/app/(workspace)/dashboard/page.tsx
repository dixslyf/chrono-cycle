import DashNav from "@/app/components/dashboard/dashNav";
import Timeline from "@/app/components/dashboard/timeline";

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

// get currrent month index
const currentMonthIndex = new Date().getMonth();
const currentMonth = monthsData[currentMonthIndex].value;

// generate the days for the current month
const year = new Date().getFullYear();
const daysInMonth = new Date(year, currentMonthIndex + 1, 0).getDate();

const days = Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
    const date = new Date(year, currentMonthIndex, day);
    // for label we use first char of weekday
    const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "short" });
    const label = `${dayOfWeek[0]}${day}`;
    return { day, label, date };
});

export default function Dashboard() {
    return (
        <>
            <DashNav months={monthsData} initialMonth={currentMonth} />
            <Timeline days={days} />
        </>
    );
}
