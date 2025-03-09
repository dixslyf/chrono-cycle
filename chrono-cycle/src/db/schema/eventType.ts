import { pgEnum } from "drizzle-orm/pg-core";

export const eventTypeEnum = pgEnum("event_type", ["task", "activity"]);
export default eventTypeEnum;
