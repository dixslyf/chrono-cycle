import { baseLogger } from "@/server/common/log";

// Authentication logs are disabled by default.
const enableAuthLogs = (process.env.AUTH_LOG ?? "0") === "1";

export const authLogger = baseLogger.child({ scope: "auth" });
if (!enableAuthLogs) {
    authLogger.level = "silent";
}
export const serverActionLogger = baseLogger.child({ scope: "server-action" });
