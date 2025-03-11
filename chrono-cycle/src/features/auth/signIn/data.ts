import * as E from "fp-ts/Either";
import { z } from "zod";

import { InvalidCredentialsError, ValidationError } from "@common/errors";

export const usernameSchema = z
    .string()
    .nonempty("Please enter your username.");

export const passwordSchema = z
    .string()
    .nonempty("Please enter your password.");

export const rememberSchema = z.boolean();

export const payloadSchema = z.object({
    username: usernameSchema,
    password: passwordSchema,
    remember: rememberSchema,
});

export type Payload = z.input<typeof payloadSchema>;
export type ParsedPayload = z.output<typeof payloadSchema>;

export type Failure =
    | ValidationError<"username" | "password" | "remember">
    | InvalidCredentialsError;

export type Result = E.Either<Failure, void>;
