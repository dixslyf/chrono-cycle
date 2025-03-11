"use client";

import { useState, useEffect, startTransition, useActionState } from "react";
import { updateSettings, fetchSettings } from "@/server/settings/actions";
import {
    NativeSelect,
    Button,
    Stack,
    Text,
    Group,
    SimpleGrid,
} from "@mantine/core";
import Toggle from "./toggle";

const SettingsForm = () => {
    // store initial settings here
    const [initialSettings, setInitialSettings] = useState<{
        startDayOfWeek: string;
        dateFormat: string;
        enableEmailNotifications: boolean;
        enableDesktopNotifications: boolean;
    } | null>(null);

    const [startDayOfWeek, setStartDayOfWeek] = useState<string>("Monday");
    const [dateFormat, setDateFormat] = useState<string>("DD/MM/YYYY");
    const [enableEmailNotifications, setEmailNotifications] =
        useState<boolean>(false);
    const [enableDesktopNotifications, setDesktopNotifications] =
        useState<boolean>(false);

    // Define the action state using useActionState
    const [formStatus, submitAction, isSubmitting] = useActionState(
        updateSettings,
        { submitSuccess: false },
    );

    // Fetch settings on component mount
    useEffect(() => {
        const loadSettings = async () => {
            const settingsResponse = await fetchSettings();
            if (settingsResponse.submitSuccess) {
                const settings = {
                    startDayOfWeek: settingsResponse.startDayOfWeek || "Monday",
                    dateFormat: settingsResponse.dateFormat || "DD/MM/YYYY",
                    enableEmailNotifications:
                        settingsResponse.enableEmailNotifications || false,
                    enableDesktopNotifications:
                        settingsResponse.enableDesktopNotifications || false,
                };
                setInitialSettings(settings);
                setStartDayOfWeek(settings.startDayOfWeek);
                setDateFormat(settings.dateFormat);
                setEmailNotifications(settings.enableEmailNotifications);
                setDesktopNotifications(settings.enableDesktopNotifications);
            }
        };

        loadSettings();
    }, []);

    // check if any of the settings have changed
    const hasChanges =
        initialSettings &&
        (startDayOfWeek !== initialSettings.startDayOfWeek ||
            dateFormat !== initialSettings.dateFormat ||
            enableEmailNotifications !==
                initialSettings.enableEmailNotifications ||
            enableDesktopNotifications !==
                initialSettings.enableDesktopNotifications);

    // update intial settings after submit to persist locally
    useEffect(() => {
        if (formStatus.submitSuccess) {
            setInitialSettings({
                startDayOfWeek,
                dateFormat,
                enableEmailNotifications,
                enableDesktopNotifications,
            });
        }
    }, [
        formStatus.submitSuccess,
        startDayOfWeek,
        dateFormat,
        enableEmailNotifications,
        enableDesktopNotifications,
    ]);

    // Handle form submission
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append("startDayOfWeek", startDayOfWeek);
        formData.append("dateFormat", dateFormat);
        formData.append(
            "enableEmailNotifications",
            enableEmailNotifications.toString(),
        );
        formData.append(
            "enableDesktopNotifications",
            enableDesktopNotifications.toString(),
        );

        startTransition(() => {
            submitAction(formData);
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <Stack gap="md" align="stretch" className="pb-8">
                <Text className="text-3xl font-bold">General</Text>
                <Text className="text-gray-400 font-semibold mb-2">
                    Manage General Settings
                </Text>

                <SimpleGrid cols={3}>
                    <Group justify="space-between">
                        <Text className="text-xl font-semibold">
                            Start Day of Week:
                        </Text>
                        <NativeSelect
                            data={["Monday", "Sunday"]}
                            value={startDayOfWeek}
                            onChange={(event) => {
                                setStartDayOfWeek(event.currentTarget.value);
                            }}
                        />
                    </Group>
                    <div /> {/* center column left empty */}
                    <Group justify="space-between">
                        <Text className="text-xl font-semibold">
                            Date Format:
                        </Text>
                        <NativeSelect
                            data={["MM/DD/YYYY", "DD/MM/YYYY", "YYYY/MM/DD"]}
                            value={dateFormat}
                            onChange={(event) =>
                                setDateFormat(event.currentTarget.value)
                            }
                        />
                    </Group>
                </SimpleGrid>
                <hr />
            </Stack>

            <Stack>
                <Text className="text-3xl font-bold">Notifications</Text>
                <Text className="text-gray-400 font-semibold mb-2">
                    Update Your Notification Perferences
                </Text>

                <SimpleGrid cols={3}>
                    <Group justify="space-between">
                        <Text className="text-xl font-semibold">
                            Email Notifications:
                        </Text>
                        <Toggle
                            checked={enableEmailNotifications}
                            onChange={(e) =>
                                setEmailNotifications(e.target.checked)
                            }
                        />
                    </Group>
                    <div /> {/* center column left */}
                    <Group justify="space-between">
                        <Text className="text-xl font-semibold">
                            Desktop Notifications:
                        </Text>
                        <Toggle
                            checked={enableDesktopNotifications}
                            onChange={(e) =>
                                setDesktopNotifications(e.target.checked)
                            }
                        />
                    </Group>
                </SimpleGrid>
                <hr />
            </Stack>

            <Stack gap="md" className="mt-2 items-center">
                <Text
                    className={`font-semibold text-xl ${formStatus.submitSuccess ? "text-green-500" : "text-red-500"}`}
                >
                    {formStatus.submitSuccess
                        ? "Settings updated successfully!"
                        : formStatus.errorMessage}
                </Text>
                <Group className="w-full" justify="flex-end">
                    <Button
                        type="submit"
                        disabled={!hasChanges || isSubmitting}
                        loading={isSubmitting}
                        className={`transition-colors duration-200 ease-linear ${
                            !hasChanges || isSubmitting
                                ? "bg-gray-400 cursor-default text-palette3"
                                : "bg-palette2 hover:bg-palette1"
                        }`}
                    >
                        Save Changes
                    </Button>
                </Group>
            </Stack>
        </form>
    );
};

export default SettingsForm;
