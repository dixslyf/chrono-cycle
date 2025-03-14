import * as E from "fp-ts/Either";
import { z, type ZodTypeDef } from "zod";

import { ValidationError } from "@/common/errors";

export function validate<
    Schema extends z.ZodType<Output, Def, Input>,
    Output,
    Input,
    Def extends ZodTypeDef = ZodTypeDef,
>(
    schema: Schema,
    input: Input,
): E.Either<ValidationError<Extract<keyof Input, string>>, z.infer<Schema>> {
    const parseResult = schema.safeParse(input) as z.SafeParseReturnType<
        Input,
        z.infer<Schema>
    >;
    if (!parseResult.success) {
        const formattedZodErrors = parseResult.error.format();
        const issues = Object.fromEntries(
            Object.entries(formattedZodErrors)
                .filter(([_key, value]) => !Array.isArray(value))
                .map(([key, value]) => {
                    // We filtered out array values, so this is guaranteed
                    // to be a `{ _errors: string[] }`.
                    value = value as { _errors: string[] };
                    return [
                        key,
                        Array.isArray(value?._errors) ? value._errors : [],
                    ];
                }),
        );
        return E.left(ValidationError(issues));
    }
    return E.right(parseResult.data);
}
