"use client";

import {
    ActionIcon,
    Button,
    Group,
    Menu,
    Modal,
    Select,
    Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import {
    ArrowBigLeft,
    ArrowBigRight,
    Calendar,
    ChartNoAxesGantt,
    ChevronDown,
    ClipboardList,
} from "lucide-react";

import { CreateProjectForm } from "@/app/components/templates/createProjectForm";
import { notifyError } from "@/app/utils/notifications";
import { listProjectTemplatesOptions } from "@/app/utils/queries/listProjectTemplates";

interface Month {
    value: string;
    label: string;
}

interface DashNavProps {
    months?: Month[];
    selectedMonth: string;
    onSelectMonth: (month: string) => void;
    year: number;
}

function DashNav({ months, selectedMonth, onSelectMonth, year }: DashNavProps) {
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
    const [
        createProjectModalOpened,
        { open: openCreateProjectModal, close: closeCreateProjectModal },
    ] = useDisclosure();

    // Get the list of project templates.
    const listPtsQuery = useQuery({
        ...listProjectTemplatesOptions({
            onError: closeCreateProjectModal,
        }),
        enabled: false,
    });

    async function onClickCreateProject() {
        openCreateProjectModal();
        const result = await listPtsQuery.refetch();
        if (result.data && result.data.length === 0) {
            notifyError({
                message: "No project templates to create a project from.",
            });
            closeCreateProjectModal();
        }
    }

    return (
        <>
            <Modal
                title="Create Project"
                centered
                opened={createProjectModalOpened}
                onClose={closeCreateProjectModal}
            >
                <CreateProjectForm
                    onSuccess={closeCreateProjectModal}
                    projectTemplates={listPtsQuery.data}
                    isPendingProjectTemplates={listPtsQuery.isPending}
                />
            </Modal>
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
                <Group className="w-1/3 items-center" justify="center">
                    <Group className="text-lg font-semibold h-full text-palette2 border-b-2 border-b-palette2 p-0 gap-0">
                        <ChartNoAxesGantt />
                        Timeline
                    </Group>
                </Group>

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
                                onClick={onClickCreateProject}
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
