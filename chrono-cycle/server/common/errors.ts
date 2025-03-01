export type AuthenticationError = {
    _errorKind: "AuthenticationError";
};

export function AuthenticationError(): AuthenticationError {
    return { _errorKind: "AuthenticationError" };
}

export type DoesNotExistError = {
    _errorKind: "DoesNotExistError";
};

export function DoesNotExistError(): DoesNotExistError {
    return { _errorKind: "DoesNotExistError" };
}

export type InternalError = {
    _errorKind: "InternalError";
    context: string;
};

export function InternalError(context: string): InternalError {
    return { _errorKind: "InternalError", context };
}

export type ValidationIssues<K extends string = string> = Record<K, string[]>;

export type ValidationError<K extends string = string> = {
    _errorKind: "ValidationError";
    issues: ValidationIssues<K>;
};

export function ValidationError<K extends string = string>(
    issues: ValidationIssues<K>,
): ValidationError {
    return { _errorKind: "ValidationError", issues };
}
