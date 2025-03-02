"use client";

import { useState, useEffect, startTransition, useActionState } from "react";
import { updateSettings, fetchSettings } from "@/server/settings/actions";

interface FormStatus {
    success: boolean;
    message: string;
}

const SettingsForm = () => {
    const [startDayOfWeek, setStartDayOfWeek] = useState<string>("Monday");
    const [dateFormat, setDateFormat] = useState<string>("DD/MM/YYYY");
    const [enableEmailNotifications, setEmailNotifications] = useState<boolean>(false);
    const [enableDesktopNotifications, setDesktopNotifications] = useState<boolean>(false);

    // Define the action state using useActionState
    const [formStatus, submitAction, isSubmitting] = useActionState(
        async (previousState: FormStatus, formData: FormData) => {
            try {
                const response = await updateSettings(formData);
                return {
                    success: response.submitSuccess,
                    message: response.submitSuccess
                        ? "Settings updated successfully!"
                        : response.errorMessage || "An error occurred.",
                };
            } catch (error) {
                return { success: false, message: "An error occurred while updating settings." };
            }
        },
        { success: false, message: "" }
    );

    // Fetch settings on component mount
    useEffect(() => {
        const loadSettings = async () => {
            const settingsResponse = await fetchSettings();
            if (settingsResponse.submitSuccess) {
                setStartDayOfWeek(settingsResponse.startDayOfWeek || "Monday");
                setDateFormat(settingsResponse.dateFormat || "DD/MM/YYYY");
                setEmailNotifications(settingsResponse.enableEmailNotifications || false);
                setDesktopNotifications(settingsResponse.enableDesktopNotifications || false);
            }
        };

        loadSettings();
    }, []);

    // Handle form submission
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const formData = new FormData();
        formData.append("startDayOfWeek", startDayOfWeek);
        formData.append("dateFormat", dateFormat);
        formData.append("enableEmailNotifications", enableEmailNotifications.toString());
        formData.append("enableDesktopNotifications", enableDesktopNotifications.toString());

        startTransition(() => {
            submitAction(formData);
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <section>
                <h1>General</h1>
                <span>Manage general settings</span>

                <div>
                    <label htmlFor="day">Start Day of Week</label>
                    <select
                        name="day"
                        id="day"
                        value={startDayOfWeek}
                        onChange={(e) => setStartDayOfWeek(e.target.value)}
                    >
                        {["Monday", "Sunday"].map((day) => (
                            <option value={day} key={day}>
                                {day}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="dateFormat">Date Format</label>
                    <select
                        name="dateFormat"
                        id="dateFormat"
                        value={dateFormat}
                        onChange={(e) => setDateFormat(e.target.value)}
                    >
                        {["MM/DD/YYYY", "DD/MM/YYYY", "YYYY/MM/DD"].map((format) => (
                            <option value={format} key={format}>
                                {format}
                            </option>
                        ))}
                    </select>
                </div>
                <hr />
            </section>

            <section>
                <h1>Notifications</h1>
                <span>Update your notification preferences</span>

                <div>
                    <label htmlFor="emailToggle">Email Notifications</label>
                    <input
                        type="checkbox"
                        name="emailToggle"
                        id="emailToggle"
                        checked={enableEmailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                    />
                </div>

                <div>
                    <label htmlFor="desktopToggle">Desktop Notifications</label>
                    <input
                        type="checkbox"
                        name="desktopToggle"
                        id="desktopToggle"
                        checked={enableDesktopNotifications}
                        onChange={(e) => setDesktopNotifications(e.target.checked)}
                    />
                </div>
                <hr />
            </section>

            <section>
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Changes"}
                </button>

                {formStatus.message && (
                    <p className={formStatus.success ? "success" : "error"}>
                        {formStatus.message}
                    </p>
                )}
            </section>
        </form>
    );
};

export default SettingsForm;