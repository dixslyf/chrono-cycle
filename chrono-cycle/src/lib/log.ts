import pino, { TransportTargetOptions } from "pino";

const level = process.env.NODE_ENV === "production" ? "warn" : "trace";
const targets: TransportTargetOptions[] = [];

// Output logs to a file in production and dev, but not test.
if (process.env.NODE_ENV !== "test") {
    targets.push({
        level,
        target: "pino/file",
        options: { destination: "server-logs.log" },
    });
}

if (process.env.NODE_ENV !== "production") {
    targets.push({ level, target: "pino-pretty", options: { colorize: true } });
}

export const baseLogger = pino({
    level,
    transport: { targets },
});
