"use client";

import { useState, useEffect, startTransition, useActionState } from "react";
import { updateSettings, fetchSettings } from "@/server/settings/actions";
import { Select, Button } from "@mantine/core";
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
            <section className="flex flex-col gap-3">
                <h1 className="text-4xl font-bold">General</h1>
                <span className="text-gray-400 font-semibold mb-2">
                    Manage general settings
                </span>

                <div className="flex justify-between my-2">
                    <div className="flex w-2/5 justify-between">
                        <label className="text-xl font-semibold">
                            Start Day of Week:
                        </label>
                        <Select
                            data={["Monday", "Sunday"]}
                            value={startDayOfWeek}
                            onChange={(value, _) => {
                                setStartDayOfWeek(value ?? "");
                            }}
                        />
                    </div>

                    <div className="flex w-2/5 justify-between">
                        <label className="text-xl font-semibold">
                            Date Format:
                        </label>
                        <Select
                            data={["MM/DD/YYYY", "DD/MM/YYYY", "YYYY/MM/DD"]}
                            value={dateFormat}
                            onChange={(value, _) => setDateFormat(value ?? "")}
                        />
                    </div>
                </div>
                <hr />
            </section>

            <section className="flex flex-col gap-3">
                <h1 className="text-4xl font-bold">Notifications</h1>
                <span className="text-gray-400 font-semibold mb-2">
                    Update your notification preferences
                </span>

                <div className="flex justify-between my-2">
                    <div className="flex w-2/5 justify-between">
                        <label className="text-xl font-semibold">
                            Email Notifications:
                        </label>
                        <Toggle
                            checked={enableEmailNotifications}
                            onChange={(e) =>
                                setEmailNotifications(e.target.checked)
                            }
                        />
                    </div>

                    <div className="flex w-2/5 justify-between">
                        <label className="text-xl font-semibold">
                            Desktop Notifications:
                        </label>
                        <Toggle
                            checked={enableDesktopNotifications}
                            onChange={(e) =>
                                setDesktopNotifications(e.target.checked)
                            }
                        />
                    </div>
                </div>
                <hr />
            </section>

            <section className="flex flex-col gap-3 items-center mt-2">
                <p
                    className={`font-semibold text-xl ${formStatus.submitSuccess ? "text-green-500" : "text-red-500"}`}
                >
                    {formStatus.submitSuccess
                        ? "Settings updated successfully!"
                        : formStatus.errorMessage}
                </p>
                <div className="w-full flex justify-end">
                    {hasChanges && (
                        <Button
                            type="submit"
                            className="bg-palette2 hover:bg-palette1 transition-colors duration-200 ease-linear"
                        >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                    )}
                </div>
            </section>
        </form>
    );
};

export default SettingsForm;
