export type BaseError = {
    _errorKind: string;
};

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

export type TagExistsError = {
    _errorKind: "TagExistsError";
};

export function TagExistsError(): TagExistsError {
    return { _errorKind: "TagExistsError" };
}

export type AssertionError = {
    _errorKind: "AssertionError";
    context: string;
};

export function AssertionError(context?: string): AssertionError {
    return {
        _errorKind: "AssertionError",
        context: context ? context : "An assertion failed",
    };
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

export type EraseAssertionError<E> = Exclude<E, AssertionError> | InternalError;

export type RestoreAssertionError<E> =
    | Exclude<E, InternalError>
    | AssertionError;

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

export type InvalidCredentialsError = {
    _errorKind: "InvalidCredentialsError";
};

export function InvalidCredentialsError(): InvalidCredentialsError {
    return {
        _errorKind: "InvalidCredentialsError",
    };
}

export type DuplicateReminderError = {
    _errorKind: "DuplicateReminderError";
};

export function DuplicateReminderError(): DuplicateReminderError {
    return { _errorKind: "DuplicateReminderError" };
}

export type MalformedTimeStringError = {
    _errorKind: "MalformedTimeStringError";
};

export function MalformedTimeStringError(): MalformedTimeStringError {
    return { _errorKind: "MalformedTimeStringError" };
}
