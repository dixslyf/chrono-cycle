export type AuthenticationError = {
    _errorKind: "AuthenticationError";
};

export type ValidationIssues<K extends string = string> = Record<K, string[]>;

export type ValidationError<K extends string = string> = {
    _errorKind: "ValidationError";
    issues: ValidationIssues<K>;
};
