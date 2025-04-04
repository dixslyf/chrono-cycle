"use client";

import { Box, Button, Text } from "@mantine/core";

import { Event } from "@/common/data/domain";

interface EventBarProps {
    event: Event;
    startIndex: number;
    endIndex: number;
    cellWidth: number;
    textColor: string;
    bg: string;
    onEventClick: (event: Event) => void;
}

function EventBar({
    event,
    startIndex,
    endIndex,
    cellWidth,
    textColor,
    bg,
    onEventClick,
}: EventBarProps) {
    const leftOffset = startIndex * cellWidth;
    const width = (endIndex - startIndex + 1) * cellWidth;

    return (
        <Button
            className="rounded-lg shadow-md"
            mt={2}
            color={bg}
            size="compact-md"
            style={{
                marginLeft: `${leftOffset}px`,
                width: `${width}px`,
            }}
            onClick={() => onEventClick(event)}
        >
            <Text c={textColor} size="md" fw={500} truncate="end">
                {event.name}
            </Text>
        </Button>
    );
}

export default EventBar;
