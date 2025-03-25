import { baseLogger } from "@/lib/log";

export const stubTriggerLog = baseLogger.child({ scope: "stub-trigger.dev" });
