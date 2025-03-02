import { getCurrentUserSession } from "@/server/auth/sessions";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export function wrapAuthRedirectLogin<P extends object>(
    wrapped: (...props: P[]) => Promise<ReactNode>,
): (...props: P[]) => Promise<ReactNode> {
    return async function (...props: P[]) {
        const userSession = await getCurrentUserSession();
        if (!userSession) {
            return redirect("/");
        }
        return wrapped(...props);
    };
}

export function wrapAuthRedirectDashboard<P extends object>(
    wrapped: (...props: P[]) => Promise<ReactNode>,
): (...props: P[]) => Promise<ReactNode> {
    return async function (...props: P[]) {
        const userSession = await getCurrentUserSession();
        if (userSession) {
            return redirect("/dashboard");
        }
        return wrapped(...props);
    };
}
