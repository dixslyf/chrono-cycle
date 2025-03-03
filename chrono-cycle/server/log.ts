import pino, { TransportTargetOptions } from "pino";

const targets: TransportTargetOptions[] = [
    {
        target: "pino/file",
        options: { destination: "server-logs.log" },
    },
];

if (process.env.NODE_ENV !== "production") {
    targets.push({ target: "pino-pretty", options: { colorize: true } });
}

export const logger = pino({
    level: process.env.NODE_ENV === "production" ? "error" : "trace",
    transport: { targets },
});
