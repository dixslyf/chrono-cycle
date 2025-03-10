"use client";

import DisplayEventDetails from "@/app/components/projects/displayEventDetails";
import Link from "next/link";
import { sampleEvent, sampleEvent2, sampleEvent3 } from "@/app/utils/sampleEventData";

export default function EventTestPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Event Details Test Page</h1>
        <Link href="/dashboard" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Back to Dashboard
        </Link>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Sample Event 1: Complete Event with Reminders and Tags</h2>
        <DisplayEventDetails event={sampleEvent} />
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Sample Event 2: Minimal Event (No Reminders or Tags)</h2>
        <DisplayEventDetails event={sampleEvent2} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Sample Event 3: Completed Event</h2>
        <DisplayEventDetails event={sampleEvent3} />
      </div>
    </div>
  );
} 