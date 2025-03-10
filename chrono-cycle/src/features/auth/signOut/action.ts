"use server";

import {
    deleteSessionTokenCookie,
    invalidateSession,
    UserSession,
} from "@/server/common/auth/sessions";
import { wrapServerAction } from "@/server/features/decorators";
import { redirect } from "next/navigation";

import { type SignOutFormState } from "./data";

async function signOutActionImpl(
    userSession: UserSession,
): Promise<SignOutFormState> {
    invalidateSession(userSession.session.id);
    deleteSessionTokenCookie();

    return redirect("/");
}

export const signOutAction = wrapServerAction("signOut", signOutActionImpl);
