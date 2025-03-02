"use server";

import { getCurrentSession } from "@/server/auth/sessions";
import { z } from "zod";
import getDb from "@/server/db";
import { userSettings } from "@/server/db/schema/userSettings";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getUserSettings } from "../auth/users";

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

// Define the server-side action for updating settings
export const updateSettings = async (
    _previousState: UpdateSettingsFormState,
    formData: FormData,
): Promise<UpdateSettingsFormState> => {
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

    // Verify user identity
    const sessionResults = await getCurrentSession();
    if (!sessionResults) {
        return {
            submitSuccess: false,
            errorMessage: "Authentication failed",
        };
    }

    const {
        startDayOfWeek,
        dateFormat,
        enableEmailNotifications,
        enableDesktopNotifications,
    } = parseResult.data;
    const userId = sessionResults.user.id;

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
};

// Define the server-side action for fetching settings
export const fetchSettings = async (): Promise<UpdateSettingsFormState> => {
    // Verify user identity
    const sessionResults = await getCurrentSession();
    if (!sessionResults) {
        return {
            submitSuccess: false,
            errorMessage: "Authentication failed",
        };
    }

    const userId = sessionResults.user.id;
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
};
