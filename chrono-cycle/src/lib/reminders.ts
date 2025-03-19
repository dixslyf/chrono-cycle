import * as E from "fp-ts/Either";

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
