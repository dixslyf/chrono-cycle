import { NextApiRequest, NextApiResponse } from 'next';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { settings } from '@/server/db/schema/settings';
import { users } from '@/server/db/schema/users';
import { eq } from "drizzle-orm";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

interface UpdateSettingsBody {
    startDayOfWeek: string;
    dateFormat: string;
    emailNotification?: boolean;
    desktopNotification?: boolean;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { userId } = req.query;

    if (isNaN(Number(userId))) {
        return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Handle GET request to fetch user settings
    if (req.method === 'GET') {
        try {
            const userSettings = await db
                .select()
                .from(settings)
                .where(eq(settings.userId, Number(userId))); 

            if (userSettings.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            const userSetting = userSettings[0];

            return res.status(200).json({
                startDayOfWeek: userSetting.startDayOfWeek,
                dateFormat: userSetting.dateFormat,
                emailNotification: userSetting.emailNotification,
                desktopNotification: userSetting.desktopNotification,
            });
        } catch (error) {
            console.error("Error fetching user settings:", error);
            return res.status(500).json({ error: 'Failed to fetch user settings' });
        }
    }

    // Handle PUT request to update user settings
    else if (req.method === 'PUT') {
        const { startDayOfWeek, dateFormat, emailNotification, desktopNotification } = req.body as UpdateSettingsBody;

        // Validate required fields
        if (!startDayOfWeek || !dateFormat) {
            return res.status(400).json({ error: 'startDayOfWeek and dateFormat are required' });
        }

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
                .where(eq(settings.userId, Number(userId))); 

            if (updatedSettings.rowCount === 0) {
                return res.status(404).json({ error: 'User not found or no changes made' });
            }

            return res.status(200).json({ message: 'Settings updated successfully' });
        } catch (error) {
            console.error("Error updating user settings:", error);
            return res.status(500).json({ error: 'Failed to update user settings' });
        }
    }

    // Handle unsupported HTTP methods
    else {
        res.setHeader('Allow', ['GET', 'PUT']);
        res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
}