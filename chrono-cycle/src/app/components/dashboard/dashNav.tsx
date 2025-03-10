"use client";

import { ActionIcon, Button, Menu, Select, Text } from "@mantine/core";
import {
    ArrowBigLeft,
    ArrowBigRight,
    Calendar,
    ChartNoAxesGantt,
    ChevronDown,
    ClipboardList,
} from "lucide-react";

interface Month {
    value: string;
    label: string;
}

interface DashNavProps {
    months?: Month[];
    selectedMonth: string;
    onSelectMonth: (month: string) => void;
    year: number;
    activeView: "timeline" | "calendar";
    onViewChange: (view: "timeline" | "calendar") => void;
}

function DashNav({
    months,
    selectedMonth,
    onSelectMonth,
    year,
    activeView,
    onViewChange,
}: DashNavProps) {
    // handle back and forth arrow changes
    const handleMonthChange = (delta: number) => {
        if (!months || months.length === 0) return;
        const currentIndex = months.findIndex((m) => m.value === selectedMonth);
        if (currentIndex === -1) {
            onSelectMonth(months[0].value);
            return;
        }
        const newIndex = (currentIndex + delta + months.length) % months.length;
        onSelectMonth(months[newIndex].value);
    };

    const handleSelectChange = (value: string | null) => {
        if (value) onSelectMonth(value);
    };

    return (
        <>
            <nav className="flex h-12 border-b-2 border-gray-300">
                {/* year arrows and month select */}
                <div className="ml-4 flex items-center gap-2 w-1/3">
                    <div className="flex items-center">
                        <ActionIcon
                            onClick={() => handleMonthChange(-1)}
                            variant="transparent"
                            className="text-palette5 hover:text-gray-500"
                        >
                            <ArrowBigLeft />
                        </ActionIcon>
                        <ActionIcon
                            onClick={() => handleMonthChange(1)}
                            variant="transparent"
                            className="text-palette5 hover:text-gray-500"
                        >
                            <ArrowBigRight />
                        </ActionIcon>
                    </div>
                    <Select
                        data={months}
                        value={selectedMonth}
                        onChange={handleSelectChange}
                        placeholder="Select Month"
                        variant="unstyled"
                        className="font-semibold w-28"
                        rightSection={null}
                        rightSectionWidth={0}
                        styles={(theme) => ({
                            input: {
                                fontSize: theme.fontSizes.xl,
                                textAlign: "center",
                            },
                        })}
                        comboboxProps={{ shadow: "md" }}
                    />
                    {/* display the dynamic year */}
                    <Text className="font-semibold text-xl">{year}</Text>
                </div>

                {/* calendar / timeline button */}
                <div className="flex gap-2 w-1/3 justify-center items-center">
                    <Button
                        variant="transparent"
                        onClick={() => onViewChange("timeline")}
                        className={`text-lg font-semibold h-full hover:text-palette2 ${
                            activeView === "timeline"
                                ? "text-palette2 border-b-2 border-b-palette2 p-0 rounded-none"
                                : "text-palette1"
                        }`}
                    >
                        <ChartNoAxesGantt />
                        Timeline
                    </Button>
                    <Button
                        variant="transparent"
                        onClick={() => onViewChange("calendar")}
                        className={`text-lg font-semibold h-full  hover:text-palette2 ${
                            activeView === "calendar"
                                ? "text-palette2 border-b-2 border-b-palette2 p-0 rounded-none"
                                : "text-palette1"
                        }`}
                    >
                        <Calendar />
                        Calendar
                    </Button>
                </div>

                {/* Choose template button */}
                <div className="mr-4 w-1/3 flex justify-end items-center">
                    <Menu
                        transitionProps={{ transition: "pop-bottom-left" }}
                        position="bottom-start"
                        withinPortal
                    >
                        <Menu.Target>
                            <Button
                                rightSection={<ChevronDown />}
                                className="bg-palette2 hover:bg-palette1 text-lg"
                            >
                                Create
                            </Button>
                        </Menu.Target>
                        <Menu.Dropdown className="p-0 rounded-lg overflow-hidden">
                            <Text className="bg-palette2 flex justify-between p-2">
                                <span className="text-palette3 text-xl font-semibold">
                                    Create
                                </span>
                                <span className="text-palette4 text-lg font-semibold">
                                    Manage
                                </span>
                            </Text>
                            <Menu.Item
                                leftSection={<ClipboardList />}
                                className="text-lg hover:bg-[#00000030] p-2"
                            >
                                Choose a template
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </div>
            </nav>
        </>
    );
}

export default DashNav;
