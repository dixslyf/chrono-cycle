import * as O from "fp-ts/Option";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

import { getCurrentUserSession } from "@/lib/auth/sessions";

export function wrapAuthRedirectLogin<P extends object>(
    wrapped: (...props: P[]) => Promise<ReactNode>,
): (...props: P[]) => Promise<ReactNode> {
    return async function (...props: P[]) {
        const userSession = await getCurrentUserSession();
        if (O.isNone(userSession)) {
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
        if (O.isSome(userSession)) {
            return redirect("/dashboard");
        }
        return wrapped(...props);
    };
}
