import dayjs from "dayjs";
import * as E from "fp-ts/Either";
import { DateTime } from "luxon";

import { MalformedTimeStringError } from "@/common/errors";

export type TimeComponents = {
    hours: number;
    minutes: number;
};

export function extractTimeStringComponents(
    timeStr: string,
): E.Either<MalformedTimeStringError, TimeComponents> {
    // Match "HH:MM".
    const match = timeStr.match(/^(\d{2}):(\d{2})/);
    if (!match) {
        return E.left(MalformedTimeStringError());
    }

    // First value is the entire matched part.
    const [_, hours, minutes] = match.map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
        return E.left(MalformedTimeStringError());
    }

    return E.right({ hours, minutes });
}

export function extractTimeStringFromJSDate(date: Date): string {
    const timeStr = DateTime.fromJSDate(date).toISOTime({
        suppressSeconds: true,
        suppressMilliseconds: true,
        includeOffset: false,
    }) as string;
    return timeStr;
}

export function calculateDaysDiff(dateEarlier: Date, dateLater: Date): number {
    // Throw away the time components just to be sure.
    const ldateEarlier = DateTime.fromISO(
        DateTime.fromJSDate(dateEarlier).toISODate() as string,
    );
    const ldateLater = DateTime.fromISO(
        DateTime.fromJSDate(dateLater).toISODate() as string,
    );

    return ldateLater.diff(ldateEarlier, "days").toObject().days as number;
}

export interface Day {
    date: Date;
    label: string;
}

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
