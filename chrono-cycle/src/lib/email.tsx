/* eslint-disable @next/next/no-head-element */
import dayjs from "dayjs";
import { pipe } from "fp-ts/lib/function";
import { createTransport } from "nodemailer";
import postmarkTransport from "nodemailer-postmark-transport";
import { ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { Event } from "@/common/data/domain";
import { User } from "@/common/data/userSession";

export const emailTransport = createTransport(
    postmarkTransport({
        auth: {
            apiKey: process.env.POSTMARK_API_KEY!,
        },
    }),
);

export const FROM_ADDRESS = "reminders@chrono-cycle.dixslyf.dev";

function EmailReminder({
    user,
    event,
}: {
    user: User;
    event: Event;
}): ReactNode {
    return (
        <html>
            <head>
                <meta charSet="UTF-8" />
                <title>Event Reminder</title>
                <style>
                    {`
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: #007bff;
          color: #ffffff;
          padding: 10px;
          text-align: center;
          font-size: 20px;
          border-radius: 8px 8px 0 0;
        }
        .content {
          padding: 20px;
          text-align: left;
          font-size: 16px;
          color: #333333;
        }
        .footer {
          text-align: center;
          padding: 10px;
          font-size: 12px;
          color: #666666;
        }
        .btn {
          display: inline-block;
          padding: 10px 20px;
          color: #ffffff;
          background: #007bff;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 15px;
          text-align: center;
        }
        .btn-container {
          text-align: center;
          margin-top: 20px;
        }
      `}
                </style>
            </head>
            <body>
                <div className="container">
                    <div className="header">Event Reminder</div>
                    <div className="content">
                        <p>
                            Dear <strong>{user.username}</strong>,
                        </p>
                        <p>This is a reminder for your upcoming event:</p>
                        <p>
                            <strong>Event name:</strong> {event.name}
                        </p>
                        <p>
                            <strong>Type:</strong>{" "}
                            {pipe(
                                event.eventType.toLowerCase(),
                                (eventType) =>
                                    eventType.charAt(0).toUpperCase() +
                                    eventType.slice(1),
                            )}
                        </p>
                        <p>
                            <strong>Date:</strong>{" "}
                            {dayjs(event.startDate).format(
                                "dddd, MMMM D, YYYY",
                            )}
                        </p>
                        {event.eventType === "activity" && (
                            <p>
                                <strong>Duration:</strong> {event.duration}{" "}
                                {event.duration > 1 ? "days" : "day"}
                            </p>
                        )}
                        {event.eventType === "task" && (
                            <p>
                                <strong>Current Status:</strong>{" "}
                                {pipe(
                                    event.status.toLowerCase(),
                                    (status) =>
                                        status.charAt(0).toUpperCase() +
                                        status.slice(1),
                                )}
                            </p>
                        )}
                        <p>
                            <strong>Note:</strong>{" "}
                            {event.note.trim() === ""
                                ? "None"
                                : event.note.trim()}
                        </p>
                    </div>
                    <div className="footer">
                        &copy; 2025 ChronoCycle. All rights reserved.
                    </div>
                </div>
            </body>
        </html>
    );
}

export function generateEmailPlainText(user: User, event: Event): string {
    return `
    Event Reminder

    Dear ${user.username},

    This is a reminder for your upcoming event:

    Event Name: ${event.name}

    Event Type: ${event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}

    Date: ${dayjs(event.startDate).format("dddd, MMMM D, YYYY")}

    ${(event.eventType === "activity" ? `Duration: ${event.duration} ${event.duration > 1 ? "days" : "day"}` : "") + "\n"}
    ${(event.eventType === "task" && event.status !== "none" ? `Current Status: ${event.status.charAt(0).toUpperCase() + event.status.slice(1)}` : "") + "\n"}
    Note: ${event.note.trim() === "" ? "None" : event.note.trim()}

    -------------------------------------
    © 2025 ChronoCycle. All rights reserved.
    `;
}

export function generateEmailHtmlString(user: User, event: Event): string {
    return renderToStaticMarkup(<EmailReminder user={user} event={event} />);
}
