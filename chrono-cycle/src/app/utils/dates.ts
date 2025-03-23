import dayjs from "dayjs";

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

export function formatDate(
    date: Date,
    config?: { withTime?: boolean },
): string {
    const dateFormat = "dddd, MMMM D, YYYY";
    const timeFormat = "h:mm A";
    const format = config?.withTime
        ? `${timeFormat} [on] ${dateFormat}`
        : dateFormat;
    return dayjs(date).format(format);
}

export function formatReminderTemplateTime(time: string) {
    // Match "HH:MM".
    const match = time.match(/^(\d{2}):(\d{2})/);

    // Warning: Assumes the string is well-formed.
    // First value is the entire matched part.
    const [_, hours, minutes] = match!;
    return `${hours}:${minutes}`;
}
