"use client";

import { useState, useEffect } from "react";
import { updateSettings, fetchSettings } from "./settingsHandler";

const SettingsForm = () => {
    const [dateFormat, setDateFormat] = useState<string>();
    const [startDayOfWeek, setStartDayOfWeek] = useState<string>();
    const [enableEmailNotifications, setEmailNotifications] =
        useState<boolean>(false);
    const [enableDesktopNotifications, setDesktopNotifications] =
        useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [formStatus, setFormStatus] = useState<{
        success: boolean | null;
        message: string;
    }>({
        success: null,
        message: "",
    });

    // Fetch settings on component mount
    useEffect(() => {
        const loadSettings = async () => {
            const settingsResponse = await fetchSettings();
            if (settingsResponse.submitSuccess) {
                setStartDayOfWeek(settingsResponse.startDayOfWeek || "Monday");
                setDateFormat(settingsResponse.dateFormat || "DD/MM/YYYY");
                setEmailNotifications(
                    settingsResponse.enableEmailNotifications || false,
                );
                setDesktopNotifications(
                    settingsResponse.enableDesktopNotifications || false,
                );
            }
            setIsLoading(false);
        };

        loadSettings();
    }, []);

    // Handle form submission
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setIsLoading(true);
        setFormStatus({ success: null, message: "" });

        const formData = new FormData();
        formData.append("startDayOfWeek", startDayOfWeek || "Monday");
        formData.append("dateFormat", dateFormat || "MM/DD/YYYY");
        formData.append(
            "enableEmailNotifications",
            enableEmailNotifications.toString(),
        );
        formData.append(
            "enableDesktopNotifications",
            enableDesktopNotifications.toString(),
        );

        try {
            // Call the server action
            const response = await updateSettings(formData);

            if (response.submitSuccess) {
                setFormStatus({
                    success: true,
                    message: "Settings updated successfully!",
                });
            } else {
                setFormStatus({
                    success: false,
                    message: response.errorMessage || "An error occurred.",
                });
            }
        } catch (error) {
            setFormStatus({
                success: false,
                message: "An error occurred while updating settings.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <form onSubmit={handleSubmit}>
            <section>
                <div>
                    <h1>General</h1>
                    <span>Manage general settings</span>
                </div>

                <div>
                    <label htmlFor="day">Start Day of Week</label>
                    <select
                        name="day"
                        id="day"
                        value={startDayOfWeek}
                        onChange={(e) => setStartDayOfWeek(e.target.value)}
                    >
                        {["Monday", "Sunday"].map((day, index) => (
                            <option value={day} key={index}>
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
                        {["MM/DD/YYYY", "DD/MM/YYYY", "YYYY/MM/DD"].map(
                            (dateFormat, index) => (
                                <option value={dateFormat} key={index}>
                                    {dateFormat}
                                </option>
                            ),
                        )}
                    </select>
                </div>
                <hr />
            </section>

            <section>
                <div>
                    <h1>Notifications</h1>
                    <span>Update your notification preferences</span>
                </div>

                <div>
                    <label htmlFor="emailToggle">Email Notifications</label>
                    <input
                        type="checkbox"
                        name="emailToggle"
                        id="emailToggle"
                        checked={enableEmailNotifications}
                        onChange={(e) =>
                            setEmailNotifications(e.target.checked)
                        }
                    />
                </div>

                <div>
                    <label htmlFor="desktopToggle">Desktop Notifications</label>
                    <input
                        type="checkbox"
                        name="desktopToggle"
                        id="desktopToggle"
                        checked={enableDesktopNotifications}
                        onChange={(e) =>
                            setDesktopNotifications(e.target.checked)
                        }
                    />
                </div>
                <hr />
            </section>

            <section>
                <button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                </button>

                {/* Success or error messages */}
                {formStatus.success === true && (
                    <p className="success">{formStatus.message}</p>
                )}
                {formStatus.success === false && (
                    <p className="error">{formStatus.message}</p>
                )}
            </section>
        </form>
    );
};

export default SettingsForm;
