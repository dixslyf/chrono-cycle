import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

async function handleCookies(request: NextRequest): Promise<NextResponse> {
    const response = NextResponse.next();
    const token = request.cookies.get("session")?.value ?? null;
    if (token !== null) {
        response.cookies.set("session", token, {
            path: "/",
            maxAge: 60 * 60 * 24 * 30, // Extend by 30 days.
            sameSite: "lax",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
        });
    }
    return response;
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
    if (request.method === "GET") {
        // Extend cookie if needed. We only do this on GET requests
        // since we know that GET requests cannot make a new session.
        return handleCookies(request);
    }

    return NextResponse.next();
}
