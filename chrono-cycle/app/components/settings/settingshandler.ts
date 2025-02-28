"use server";

import { getCurrentSession } from "@/server/auth/sessions";
import { z } from "zod";
import getDb from "@/server/db";
import { settings } from "@/server/db/schema/settings";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const db = await getDb();

// Zod schema for settings validation
const updateSettingsFormSchema = z.object({
    startDayOfWeek: z.string().min(1, "Start day of week is required"),
    dateFormat: z.string().min(1, "Date format is required"),
    emailNotification: z.boolean().optional(),
    desktopNotification: z.boolean().optional(),
});

// Type for form state
interface UpdateSettingsFormState {
    submitSuccess: boolean;
    errorMessage?: string;
    errors?: {
        startDayOfWeek?: string;
        dateFormat?: string;
        emailNotification?: string;
        desktopNotification?: string;
    };
    startDayOfWeek?: string;
    dateFormat?: string;
    emailNotification?: boolean;
    desktopNotification?: boolean;
}

// Define the server-side action for updating settings
export const updateSettings = async (formData: FormData): Promise<UpdateSettingsFormState> => {
    // Validate form schema
    const parseResult = updateSettingsFormSchema.safeParse({
        startDayOfWeek: formData.get("startDayOfWeek"),
        dateFormat: formData.get("dateFormat"),
        emailNotification: formData.get("emailNotification") === "on",
        desktopNotification: formData.get("desktopNotification") === "on",
    });

    if (!parseResult.success) {
        const formattedZodErrors = parseResult.error.format();
        return {
            submitSuccess: false,
            errorMessage: "Invalid or missing fields",
            errors: {
                startDayOfWeek: formattedZodErrors.startDayOfWeek?._errors[0],
                dateFormat: formattedZodErrors.dateFormat?._errors[0],
                emailNotification: formattedZodErrors.emailNotification?._errors[0],
                desktopNotification: formattedZodErrors.desktopNotification?._errors[0],
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

    const { startDayOfWeek, dateFormat, emailNotification, desktopNotification } = parseResult.data;
    const userId = sessionResults.user.id;

    try {
        // Update settings in the database
        const updatedSettings = await db
            .update(settings)
            .set({
                startDayOfWeek,
                dateFormat,
                emailNotification,
                desktopNotification,
            })
            .where(eq(settings.userId, userId));

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
        const userSettings = await db
            .select()
            .from(settings)
            .where(eq(settings.userId, userId))
            .limit(1);

        if (userSettings.length === 0) {
            return {
                submitSuccess: false,
                errorMessage: "Settings not found for the user",
            };
        }

        const settingsData = userSettings[0];

        return {
            submitSuccess: true,
            startDayOfWeek: settingsData.startDayOfWeek,
            dateFormat: settingsData.dateFormat,
            emailNotification: settingsData.emailNotification ?? false,
            desktopNotification: settingsData.desktopNotification ?? false,
        };
    } catch (error) {
        console.error("Error fetching settings:", error);
        return {
            submitSuccess: false,
            errorMessage: "Failed to fetch settings",
        };
    }
}