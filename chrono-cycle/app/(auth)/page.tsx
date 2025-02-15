import { getCurrentSession } from "@/server/auth/sessions";
import Login from "@/app/components/login/login";

import { redirect } from "next/navigation";

export default async function Auth() {
    const sessionResult = await getCurrentSession();
    if (sessionResult) {
        return redirect("/dashboard");
    }

    return <Login />;
}
