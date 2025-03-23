import * as E from "fp-ts/Either";
import { z } from "zod";

import {
    DuplicateNameError,
    InternalError,
    ValidationError,
} from "@/common/errors";

import { userInsertSchema } from "@/db/schema";

export const payloadSchema = z.object({
    username: userInsertSchema.shape.username,
    email: userInsertSchema.shape.email,
    password: z
        .string()
        .regex(/^\S*$/, "Password must not contain whitespace")
        .regex(/.*[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/.*[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/.*[0-9]/, "Password must contain at least one number")
        .min(8, "Password must be at least 8 characters long")
        .max(128, "Password cannot exceed 128 characters"),
});

export type Payload = z.input<typeof payloadSchema>;
export type ParsedPayload = z.output<typeof payloadSchema>;

export type Failure =
    | ValidationError<"username" | "email" | "password">
    | DuplicateNameError
    | InternalError;

export type Result = E.Either<Failure, void>;
