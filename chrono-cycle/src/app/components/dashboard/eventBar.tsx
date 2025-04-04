"use client";

import { Box, Text } from "@mantine/core";

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
        <Box
            className={`rounded-lg flex items-center justify-center mt-2 cursor-pointer`}
            bg={bg}
            style={{
                marginLeft: `${leftOffset}px`,
                width: `${width}px`,
            }}
            onClick={() => onEventClick(event)}
        >
            <Text c={textColor} className="text-md font-medium">
                {event.name}
            </Text>
        </Box>
    );
}

export default EventBar;
