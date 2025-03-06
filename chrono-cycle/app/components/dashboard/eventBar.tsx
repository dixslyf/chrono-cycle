"use client";

interface EventBarProps {
    name: string;
    startIndex: number;
    endIndex: number;
    cellWidth: number;
    color: string;
    topOffset: number;
}

function EventBar({
    name,
    startIndex,
    endIndex,
    color,
    cellWidth,
    topOffset,
}: EventBarProps) {
    const leftOffset = startIndex * cellWidth;
    const width = (endIndex - startIndex + 1) * cellWidth;

    return (
        <div
            className={`absolute rounded-lg text-palette3 font-bold flex items-center justify-center text-sm ${color}`}
            style={{
                left: `${leftOffset}px`,
                width: `${width}px`,
                height: "24px",
                top: `${topOffset}px`,
            }}
        >
            {name}
        </div>
    );
}

export default EventBar;
