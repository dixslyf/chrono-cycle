// setting page
import SettingsForm from "@/app/components/settings/settingsForm";

export default function Setting() {
    return (
        <>
            {/* title */}
            <section>
                <h1>Settings</h1>
                <span>Manage your settings and preferences</span>
                <hr />
            </section>

            {/* Options section */}
            <section>
                <SettingsForm />
            </section>
        </>
    );
}
