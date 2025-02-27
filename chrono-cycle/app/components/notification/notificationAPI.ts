"use server";

import { NextApiRequest, NextApiResponse } from 'next';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import notificationMethods from '@/server/db/schema/notificationMethods';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'name is required' });
        }

        try {
            // Check if the notification method already exists
            const existingMethod = await db
                .select()
                .from(notificationMethods)
                .where(notificationMethods.name.eq(name));

            if (existingMethod.length > 0) {
                return res.status(200).json({ id: existingMethod[0].id });
            }

            // Insert the new notification method
            const newMethod = await db
                .insert(notificationMethods)
                .values({ name })
                .returning();

            return res.status(200).json({ id: newMethod[0].id });
        } catch (error) {
            console.error("Error handling notification method:", error);
            return res.status(500).json({ error: 'Failed to handle notification method' });
        }
    }

    // Handle unsupported HTTP methods
    else {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
}