"use server";

import {
    deleteSessionTokenCookie,
    invalidateSession,
    UserSession,
} from "@/server/common/auth/sessions";
import { type SignOutFormState } from "./data";
import { redirect } from "next/navigation";
import { wrapServerAction } from "@/server/features/decorators";

async function signOutActionImpl(
    userSession: UserSession,
): Promise<SignOutFormState> {
    invalidateSession(userSession.session.id);
    deleteSessionTokenCookie();

    return redirect("/");
}

export const signOutAction = wrapServerAction("signOut", signOutActionImpl);
