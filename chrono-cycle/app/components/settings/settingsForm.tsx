"use client";

import { useState, useEffect, startTransition, useActionState } from "react";
import { updateSettings, fetchSettings } from "@/server/settings/actions";
import { NativeSelect, Button } from "@mantine/core";
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
            <section className="pb-8 flex flex-col gap-3">
                <h2 className="text-3xl font-bold">General</h2>
                <span className="text-gray-400 font-semibold mb-2">
                    Manage general settings
                </span>

                <div className="flex justify-between my-2">
                    <div className="flex w-2/5 justify-between">
                        <label className="text-xl font-semibold">
                            Start Day of Week:
                        </label>
                        <NativeSelect
                            data={["Monday", "Sunday"]}
                            value={startDayOfWeek}
                            onChange={(event) => {
                                setStartDayOfWeek(event.currentTarget.value);
                            }}
                        />
                    </div>

                    <div className="flex w-2/5 justify-between">
                        <label className="text-xl font-semibold">
                            Date Format:
                        </label>
                        <NativeSelect
                            data={["MM/DD/YYYY", "DD/MM/YYYY", "YYYY/MM/DD"]}
                            value={dateFormat}
                            onChange={(event) =>
                                setDateFormat(event.currentTarget.value)
                            }
                        />
                    </div>
                </div>
                <hr />
            </section>

            <section className="flex flex-col gap-3">
                <h2 className="text-3xl font-bold">Notifications</h2>
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
                {/* <div className="w-full flex justify-end">
                    {hasChanges && (
                        <Button
                            type="submit"
                            className="bg-palette2 hover:bg-palette1 transition-colors duration-200 ease-linear"
                        >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                    )}
                </div> */}
                <div className="w-full flex justify-end">
                    <Button
                        type="submit"
                        disabled={!hasChanges || isSubmitting}
                        loading={isSubmitting}
                        // className="bg-palette2 hover:bg-palette1 transition-colors duration-200 ease-linear"
                        className={`transition-colors duration-200 ease-linear ${
                            !hasChanges || isSubmitting
                                ? "bg-gray-400 cursor-default text-palette3"
                                : "bg-palette2 hover:bg-palette1"
                        }`}
                    >
                        Save Changes
                    </Button>
                </div>
            </section>
        </form>
    );
};

export default SettingsForm;
