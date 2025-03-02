import { getCurrentUserSession } from "@/server/auth/sessions";
import Auth from "@/app/components/auth/auth";

import { redirect } from "next/navigation";

export default async function AuthPage() {
    const userSession = await getCurrentUserSession();
    if (userSession) {
        return redirect("/dashboard");
    }

    return <Auth />;
}
