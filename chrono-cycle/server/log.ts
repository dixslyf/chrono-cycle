import pino, { TransportTargetOptions } from "pino";

// Authentication logs are disabled by default.
const enableAuthLogs = (process.env.AUTH_LOG ?? "0") === "1";

const level = process.env.NODE_ENV === "production" ? "warn" : "trace";
const targets: TransportTargetOptions[] = [
    {
        level,
        target: "pino/file",
        options: { destination: "server-logs.log" },
    },
];

if (process.env.NODE_ENV !== "production") {
    targets.push({ level, target: "pino-pretty", options: { colorize: true } });
}

export const baseLogger = pino({
    level,
    transport: { targets },
});

export const authLogger = baseLogger.child({ scope: "auth" });
if (!enableAuthLogs) {
    authLogger.level = "silent";
}
export const serverActionLogger = baseLogger.child({ scope: "server-action" });
