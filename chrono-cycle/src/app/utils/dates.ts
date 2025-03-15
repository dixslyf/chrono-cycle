import { Day } from "@/app/components/dashboard/timeline";

export function generateDaysInRange(startDate: Date, endDate: Date): Day[] {
    const days: Day[] = [];
    const dateIterator = new Date(startDate);
    while (dateIterator <= endDate) {
        const dayOfWeek = dateIterator.toLocaleDateString("en-US", {
            weekday: "short",
        });
        const label = `${dayOfWeek[0]}${dateIterator.getDate()}`;
        days.push({ date: new Date(dateIterator), label });
        dateIterator.setDate(dateIterator.getDate() + 1);
    }
    return days;
}

export function areSameDay(a: Date, b: Date): boolean {
    return a.toDateString() === b.toDateString();
}
