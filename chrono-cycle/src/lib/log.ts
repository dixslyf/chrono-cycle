import pino, { TransportTargetOptions } from "pino";

const level = process.env.NODE_ENV === "production" ? "warn" : "trace";
const targets: TransportTargetOptions[] = [];

if (process.env.NODE_ENV !== "production") {
    targets.push({ level, target: "pino-pretty", options: { colorize: true } });
}

export const baseLogger = pino({
    level,
    transport: { targets },
});
