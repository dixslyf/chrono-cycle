"use client";

import { Event } from "@/common/data/domain";

interface EventBarProps {
    event: Event;
    startIndex: number;
    endIndex: number;
    cellWidth: number;
    color: string;
    topOffset: number;
    onEventClick: (event: Event) => void;
}

function EventBar({
    event,
    startIndex,
    endIndex,
    color,
    cellWidth,
    topOffset,
    onEventClick,
}: EventBarProps) {
    const leftOffset = startIndex * cellWidth;
    const width = (endIndex - startIndex + 1) * cellWidth;

    return (
        <div
            className={`absolute rounded-lg text-palette3 font-bold flex items-center justify-center text-sm ${color} mt-2`}
            style={{
                left: `${leftOffset}px`,
                width: `${width}px`,
                height: "24px",
                top: `${topOffset}px`,
            }}
            onClick={() => onEventClick(event)}
        >
            {event.name}
        </div>
    );
}

export default EventBar;
