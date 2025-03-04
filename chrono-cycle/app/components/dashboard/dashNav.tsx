"use client";
import {
    ArrowBigLeft,
    ArrowBigRight,
    Calendar,
    ChartNoAxesGantt,
    ClipboardList,
    ChevronDown,
} from "lucide-react";
import {
    SelectRoot,
    SelectLabel,
    SelectTrigger,
    SelectContent,
    SelectItem,
    createListCollection,
    SelectValueText,
} from "@chakra-ui/react";

import { Button, Menu, Text, ActionIcon, Select } from "@mantine/core";
import { useState } from "react";

interface Month {
    value: string;
    label: string;
}

interface DashNavProps {
    months?: Month[];
    initialMonth?: string;
}

function DashNav({ months, initialMonth }: DashNavProps) {
    // initialise month
    const initial =
        initialMonth || (months && months.length > 0 ? months[0].value : "");
    const [selectedMonth, setSelectedMonth] = useState<string>(initial);

    // handle back and forth arrow
    const handleMonthChange = (delta: number) => {
        if (!months || months.length === 0) return;
        const currentIndex = months.findIndex((m) => m.value === selectedMonth);
        if (currentIndex === -1) {
            setSelectedMonth(months[0].value);
            return;
        }
        const newIndex = (currentIndex + delta + months.length) % months.length;
        setSelectedMonth(months[newIndex].value);
    };

    const handleSelectChange = (value: string | null) => {
        if (value) setSelectedMonth(value);
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
                        className="font-semibold w-32"
                        rightSection={<></>}
                        styles={(theme) => ({
                            input: {
                                fontSize: theme.fontSizes.xl,
                            },
                        })}
                        comboboxProps={{ shadow: "md" }}
                    />
                </div>

                {/* calendar / timeline button */}
                <div className="flex gap-2 w-1/3 justify-center items-center">
                    <Button
                        variant="transparent"
                        className="text-palette1 text-lg font-semibold hover:text-palette2"
                    >
                        <ChartNoAxesGantt />
                        Timeline
                    </Button>
                    <Button
                        variant="transparent"
                        className="text-palette1 text-lg font-semibold hover:text-palette2"
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
