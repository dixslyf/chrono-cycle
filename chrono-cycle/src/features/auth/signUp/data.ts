import * as E from "fp-ts/Either";
import { z } from "zod";

import {
    DuplicateNameError,
    InternalError,
    ValidationError,
} from "@common/errors";

export const usernameSchema = z
    .string()
    .regex(/^\S+$/, "Username cannot contain spaces")
    .min(3, "Username must be at least 3 characters long")
    .max(255, "Username must not exceed 255 characters");

export const emailSchema = z
    .string()
    .nonempty("Email address cannot be empty")
    .email("Invalid email address");

export const passwordSchema = z
    .string()
    .regex(/^\S*$/, "Password must not contain whitespace")
    .regex(/.*[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/.*[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/.*[0-9]/, "Password must contain at least one number")
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password cannot exceed 128 characters");

export const payloadSchema = z.object({
    username: usernameSchema,
    email: emailSchema,
    password: passwordSchema,
});

export type Payload = z.input<typeof payloadSchema>;
export type ParsedPayload = z.output<typeof payloadSchema>;

export type Failure =
    | ValidationError<"username" | "email" | "password">
    | DuplicateNameError
    | InternalError;

export type Result = E.Either<Failure, void>;
