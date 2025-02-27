"use server";

import { NextApiRequest, NextApiResponse } from 'next';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { notificationMethods } from '@/server/db/schema/notificationMethods';
import { settings } from '@/server/db/schema/settings';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { userId } = req.query;

    // Handle GET request to fetch user settings
    if (req.method === 'GET') {
        try {
            const userSettings = await db
                .select()
                .from(settings)
                .where(settings.userId.eq(Number(userId)));

            if (userSettings.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            const userSetting = userSettings[0];
            const notificationMethod = await db
                .select()
                .from(notificationMethods)
                .where(notificationMethods.id.eq(userSetting.notificationMethodId));

            return res.status(200).json({
                startDayOfWeek: userSetting.startDayOfWeek,
                dateFormat: userSetting.dateFormat,
                notificationMethodId: userSetting.notificationMethodId,
            });
        } catch (error) {
            console.error("Error fetching user settings:", error);
            return res.status(500).json({ error: 'Failed to fetch user settings' });
        }
    }

    // Handle PUT request to update user settings
    else if (req.method === 'PUT') {
        const { startDayOfWeek, dateFormat, notificationMethodId } = req.body;

        // Validate required fields
        if (!startDayOfWeek || !dateFormat) {
            return res.status(400).json({ error: 'startDayOfWeek and dateFormat are required' });
        }

        try {
            // Check if the notification method exists
            if (notificationMethodId !== null) {
                const notificationMethodExists = await db
                    .select()
                    .from(notificationMethods)
                    .where(notificationMethods.id.eq(notificationMethodId));

                if (notificationMethodExists.length === 0) {
                    return res.status(400).json({ error: 'Invalid notification method' });
                }
            }

            // Update settings in the database
            const updatedSettings = await db
                .update(settings)
                .set({
                    startDayOfWeek,
                    dateFormat,
                    notificationMethodId,
                })
                .where(settings.userId.eq(Number(userId)));

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