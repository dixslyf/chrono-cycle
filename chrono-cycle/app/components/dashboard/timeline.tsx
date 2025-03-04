import { SimpleGrid, Paper } from "@mantine/core";

interface Day {
    day: number;
    label: string;
    date: Date;
}

function Timeline({ days }: { days: Day[] }) {
    // each day is one column wide, so number of columns should be days.length
    return (
        <SimpleGrid cols={days.length} spacing="xs">
            {days.map(({ day, label, date }) => {
                const isToday =
                    new Date().toDateString() === date.toDateString();

                return (
                    <Paper
                        key={day}
                        withBorder
                        p="xs"
                        className={
                            isToday
                                ? "bg-yellow-200 font-bold text-center"
                                : "text-center"
                        }
                    >
                        <text>{label}</text>
                    </Paper>
                );
            })}
        </SimpleGrid>
    );
}

export default Timeline;
