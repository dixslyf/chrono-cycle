import { getCurrentUserSession, UserSession } from "./sessions";
import { redirect } from "next/navigation";

export function checkAuth<A extends unknown[], R>(
    f: (userSession: UserSession, ...args: A) => Promise<R>,
): (...args: A) => Promise<R> {
    return async function(...args: A): Promise<R> {
        // Verify user identity and redirect if authentication failed..
        const userSession = await getCurrentUserSession();
        if (!userSession) {
            redirect("/");
        }

        return f(userSession, ...args);
    };
}
