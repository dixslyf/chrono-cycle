"use client";

import { useState, useEffect } from "react";

const SettingsForm = ({ userId, router }: { userId: number; router: any }) => {
    const [dateFormat, setDateFormat] = useState<string>("MM/dd/yyyy");
    const [startDayOfWeek, setStartDayOfWeek] = useState<string>("Sunday");
    const [emailNotifications, setEmailNotifications] = useState<boolean>(false);
    const [desktopNotifications, setDesktopNotifications] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const daysOfWeek: string[] = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];

    // Fetch user settings
    useEffect(() => {
        const fetchUserSettings = async () => {
            try {
                const response = await fetch(`./settingshandler/userId=${userId}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch user settings");
                }
                const data = await response.json();
                setStartDayOfWeek(data.startDayOfWeek);
                setDateFormat(data.dateFormat);
                setEmailNotifications(data.emailNotification);
                setDesktopNotifications(data.desktopNotification);
            } catch (error) {
                console.error("Error fetching user settings:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserSettings();
    }, [userId]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        // Update user settings
        try {
            const response = await fetch(`./settingshandler/userId=${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    startDayOfWeek,
                    dateFormat,
                    emailNotification: emailNotifications,
                    desktopNotification: desktopNotifications,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to save user settings");
            }

            // Redirect to a success page or show a success message
            router.push("/settings/success");
        } catch (error) {
            console.error("Error saving settings:", error);
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
                        {daysOfWeek.map((day, index) => (
                            <option value={day} key={index}>
                                {day}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="dateFormat">Date Format</label>
                    <input
                        type="text"
                        name="dateFormat"
                        id="dateFormat"
                        value={dateFormat}
                        onChange={(e) => setDateFormat(e.target.value)}
                    />
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
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                    />
                </div>

                <div>
                    <label htmlFor="desktopToggle">Desktop Notifications</label>
                    <input
                        type="checkbox"
                        name="desktopToggle"
                        id="desktopToggle"
                        checked={desktopNotifications}
                        onChange={(e) => setDesktopNotifications(e.target.checked)}
                    />
                </div>
                <hr />
            </section>

            <section>
                <button type="submit">Save Changes</button>
            </section>
        </form>
    );
};

export default SettingsForm;