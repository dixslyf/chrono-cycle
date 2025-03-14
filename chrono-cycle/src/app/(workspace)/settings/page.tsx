// setting page
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";

import SettingsForm from "@/app/components/settings/settingsForm";

import { UserSettings } from "@/common/data/userSession";

import { retrieveSettingsAction } from "@/features/settings/retrieve/action";

export default async function Settings() {
    const initialSettings = pipe(
        await retrieveSettingsAction(),
        // Fallback
        E.getOrElse(
            () =>
                ({
                    startDayOfWeek: "Monday",
                    dateFormat: "DD/MM/YYYY",
                    enableEmailNotifications: true,
                    enableDesktopNotifications: true,
                }) satisfies UserSettings as UserSettings,
        ),
    );

    return (
        <>
            {/* title */}
            <section className="p-8 flex flex-col gap-3">
                <h1 className="text-4xl font-bold">Settings</h1>
                <span className="text-gray-400 font-semibold mb-2">
                    Manage your settings and preferences
                </span>
                <hr />
            </section>

            {/* Options section */}
            <section className="px-8">
                <SettingsForm initialSettings={initialSettings} />
            </section>
        </>
    );
}
