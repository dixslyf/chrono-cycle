"use client";

import { Text } from "@mantine/core";

import { Event } from "@/common/data/domain";

interface EventBarProps {
    event: Event;
    startIndex: number;
    endIndex: number;
    cellWidth: number;
    color: string;
    onEventClick: (event: Event) => void;
}

function EventBar({
    event,
    startIndex,
    endIndex,
    color,
    cellWidth,
    onEventClick,
}: EventBarProps) {
    const leftOffset = startIndex * cellWidth;
    const width = (endIndex - startIndex + 1) * cellWidth;

    return (
        <div
            className={`rounded-lg flex items-center justify-center ${color} mt-2`}
            style={{
                marginLeft: `${leftOffset}px`,
                width: `${width}px`,
            }}
            onClick={() => onEventClick(event)}
        >
            <Text className="text-md font-medium text-palette3">
                {event.name}
            </Text>
        </div>
    );
}

export default EventBar;
