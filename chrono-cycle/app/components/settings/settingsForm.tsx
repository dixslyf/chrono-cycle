"use client";

import { useState } from "react";

const SettingsForm = () => {
    const [dateFormat, setDataFormat] = useState<string>("MM/dd/yyyy");
    const daysOfWeek: string[] = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];

    return (
        <>
            <form action="">
                {/* general */}
                <section>
                    {/* title */}
                    <div>
                        <h1>General</h1>
                        <span>Manage general settings</span>
                    </div>
                    {/* day of week */}
                    <div>
                        <label htmlFor="day">Start Day of Week</label>
                        <select name="day" id="day">
                            {daysOfWeek.map((day, index) => (
                                <option value={day} key={index}>
                                    {day}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* date format */}
                    <div>
                        <label htmlFor="dateFormat">Date Format</label>
                        <input
                            type="text"
                            name="dataFormat"
                            id="dataFormat"
                            value={dateFormat}
                            onChange={(e) => setDataFormat(e.target.value)}
                        />
                    </div>
                    <hr />
                </section>

                {/* notification */}
                <section>
                    {/* title */}
                    <div>
                        <h1>Notifications</h1>
                        <span>Update your notification preferences</span>
                    </div>

                    {/* email notifications */}
                    <div>
                        <label htmlFor="emailToggle">Email Notifications</label>
                        {/* TODO */}
                        {/* Create toggle */}
                        <input
                            type="checkbox"
                            name="emailToggle"
                            id="emailToggle"
                        />
                        <span></span>
                    </div>

                    {/* desktop notifications */}
                    <div>
                        <label htmlFor="desktopToggle">
                            Desktop Notifications
                        </label>
                        {/* TODO */}
                        {/* Create toggle */}
                        <input
                            type="checkbox"
                            name="desktopToggle"
                            id="desktopToggle"
                        />
                        <span></span>
                    </div>
                    <hr />
                </section>

                {/* submit button */}
                <section>
                    {/* TODO */}
                    {/* Should have this entire section show up only when there are changes to any inputs */}
                    <button type="submit">Save Changes</button>
                </section>
            </form>
        </>
    );
};

export default SettingsForm;