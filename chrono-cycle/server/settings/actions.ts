"use server";

import { UserSession } from "@/server/auth/sessions";
import { z } from "zod";
import getDb from "@/server/db";
import { userSettings } from "@/server/db/schema/userSettings";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getUserSettings } from "@/server/auth/users";
import { wrapServerAction } from "@/server/decorators";

const db = await getDb();

// Zod schema for settings validation
const updateSettingsFormSchema = z.object({
    startDayOfWeek: z.enum(["Monday", "Sunday"]),
    dateFormat: z.enum(["MM/DD/YYYY", "DD/MM/YYYY", "YYYY/MM/DD"]),
    enableEmailNotifications: z.boolean().optional(),
    enableDesktopNotifications: z.boolean().optional(),
});

// Type for form state
interface UpdateSettingsFormState {
    submitSuccess: boolean;
    errorMessage?: string;
    errors?: {
        startDayOfWeek?: string;
        dateFormat?: string;
        enableEmailNotifications?: string;
        enableDesktopNotifications?: string;
    };
    startDayOfWeek?: string;
    dateFormat?: string;
    enableEmailNotifications?: boolean;
    enableDesktopNotifications?: boolean;
}

async function updateSettingsImpl(
    userSession: UserSession,
    _previousState: UpdateSettingsFormState,
    formData: FormData,
): Promise<UpdateSettingsFormState> {
    // Validate form schema
    const parseResult = updateSettingsFormSchema.safeParse({
        startDayOfWeek: formData.get("startDayOfWeek") as "Monday" | "Sunday",
        dateFormat: formData.get("dateFormat") as
            | "MM/DD/YYYY"
            | "DD/MM/YYYY"
            | "YYYY/MM/DD",
        enableEmailNotifications:
            formData.get("enableEmailNotifications") === "true" ? true : false,
        enableDesktopNotifications:
            formData.get("enableDesktopNotifications") === "true"
                ? true
                : false,
    });

    if (!parseResult.success) {
        const formattedZodErrors = parseResult.error.format();
        return {
            submitSuccess: false,
            errorMessage: "Invalid or missing fields",
            errors: {
                startDayOfWeek: formattedZodErrors.startDayOfWeek?._errors[0],
                dateFormat: formattedZodErrors.dateFormat?._errors[0],
                enableEmailNotifications:
                    formattedZodErrors.enableEmailNotifications?._errors[0],
                enableDesktopNotifications:
                    formattedZodErrors.enableDesktopNotifications?._errors[0],
            },
        };
    }

    const {
        startDayOfWeek,
        dateFormat,
        enableEmailNotifications,
        enableDesktopNotifications,
    } = parseResult.data;
    const userId = userSession.user.id;

    try {
        // Update settings in the database
        await db
            .update(userSettings)
            .set({
                startDayOfWeek,
                dateFormat,
                enableEmailNotifications,
                enableDesktopNotifications,
            })
            .where(eq(userSettings.userId, userId));

        // Revalidate the cache for the settings page
        revalidatePath("/settings");

        return {
            submitSuccess: true,
        };
    } catch (error) {
        console.error("Error updating settings:", error);
        return {
            submitSuccess: false,
            errorMessage: "Failed to update settings",
        };
    }
}

async function fetchSettingsImpl(
    userSession: UserSession,
): Promise<UpdateSettingsFormState> {
    const userId = userSession.user.id;
    try {
        // Fetch user settings from the database
        const settingsData = await getUserSettings(userId);
        if (!settingsData) {
            return {
                submitSuccess: false,
                errorMessage: "Unexpected missing settings",
            };
        }

        return {
            submitSuccess: true,
            startDayOfWeek: settingsData.startDayOfWeek,
            dateFormat: settingsData.dateFormat,
            enableEmailNotifications:
                settingsData.enableEmailNotifications ?? false,
            enableDesktopNotifications:
                settingsData.enableDesktopNotifications ?? false,
        };
    } catch (error) {
        console.error("Error fetching settings:", error);
        return {
            submitSuccess: false,
            errorMessage: "Failed to fetch settings",
        };
    }
}

export const fetchSettings = wrapServerAction(
    "fetchSettings",
    fetchSettingsImpl,
);

export const updateSettings = wrapServerAction(
    "updateSettings",
    updateSettingsImpl,
);
