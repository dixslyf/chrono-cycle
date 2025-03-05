import DashNav from "@/app/components/dashboard/dashNav";
import Timeline, { Day } from "@/app/components/dashboard/timeline";

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

// Get the current month index and value
const currentDate = new Date();
const currentMonthIndex = currentDate.getMonth();
const currentMonth = monthsData[currentMonthIndex].value;

// Generate a range of days spanning from one month before to one month after
function generateDaysRange(): Day[] {
    const days: Day[] = [];
    const year = currentDate.getFullYear();

    // Start from previous month
    const startDate = new Date(year, currentMonthIndex - 1, 1);
    // End at next month’s last day
    const endDate = new Date(year, currentMonthIndex + 2, 0);

    const current = new Date(startDate);
    while (current <= endDate) {
        const dayOfWeek = current.toLocaleDateString("en-US", {
            weekday: "short",
        });
        // Label: first letter of weekday + day of month (e.g., "T5" for Tuesday the 5th)
        const label = `${dayOfWeek[0]}${current.getDate()}`;
        days.push({
            date: new Date(current),
            label,
        });
        current.setDate(current.getDate() + 1);
    }
    return days;
}

const days = generateDaysRange();

export default function Dashboard() {
    // this part will only work with csr so will have to create a main component
    // const handleMonthChange = (month: string) => {
    // TODO
    // when month change will have to parse to nav to change the month as well
    // for now will just do nothing
    // };

    return (
        <>
            <DashNav months={monthsData} initialMonth={currentMonth} />
            <Timeline days={days} />
        </>
    );
}
