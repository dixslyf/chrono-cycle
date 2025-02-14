import { getCurrentSession } from "@/server/auth/sessions";
import Login from "./components/login/login";

import { redirect } from "next/navigation";

export default async function Home() {
    const sessionResult = await getCurrentSession();
    if (sessionResult) {
        return redirect("/dashboard");
    }

    return (
        <main className="m-0 w-screen h-screen">
            <Login />
        </main>
    );
}
