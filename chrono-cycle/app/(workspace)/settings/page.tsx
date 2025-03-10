// setting page
import SettingsForm from "@/app/components/settings/settingsForm";

export default function Setting() {
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
                <SettingsForm />
            </section>
        </>
    );
}
