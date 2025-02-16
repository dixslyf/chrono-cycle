import { getCurrentSession } from "@/server/auth/sessions";
import Auth from "@/app/components/auth/auth";

import { redirect } from "next/navigation";

export default async function AuthPage() {
    const sessionResult = await getCurrentSession();
    if (sessionResult) {
        return redirect("/dashboard");
    }

    return <Auth />;
}
