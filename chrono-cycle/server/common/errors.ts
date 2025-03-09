export type DoesNotExistError = {
    _errorKind: "DoesNotExistError";
};

export function DoesNotExistError(): DoesNotExistError {
    return { _errorKind: "DoesNotExistError" };
}

export type DuplicateNameError = {
    _errorKind: "DuplicateNameError";
};

export function DuplicateNameError(): DuplicateNameError {
    return { _errorKind: "DuplicateNameError" };
}

export type InternalError = {
    _errorKind: "InternalError";
    context: string;
};

export function InternalError(context?: string): InternalError {
    return {
        _errorKind: "InternalError",
        context: context ? context : "An internal error occurred",
    };
}

export type ValidationIssues<K extends string = never> = {
    [Key in K]: string[];
};

export type ValidationError<K extends string = never> = {
    _errorKind: "ValidationError";
    issues: ValidationIssues<K>;
};

export function ValidationError<K extends string = never>(
    issues: ValidationIssues<K>,
): ValidationError<K> {
    return { _errorKind: "ValidationError", issues };
}
