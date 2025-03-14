import { pgEnum } from "drizzle-orm/pg-core";

export const dependencyTypeEnum = pgEnum("dependency_type", [
    "strict",
    "flexible",
]);
