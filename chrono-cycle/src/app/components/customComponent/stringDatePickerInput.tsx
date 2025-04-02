import { DatePickerInput, type DatePickerInputProps } from "@mantine/dates";
import { DateTime } from "luxon";

import { extractDateStringFromJSDate } from "@/common/dates";

export type StringDateTimePickerProps = Omit<
    DatePickerInputProps,
    "onChange" | "value"
> & {
    onChange?: (date: string | null) => void;
    defaultValue?: string;
    value?: string;
    ref?: React.ForwardedRef<HTMLButtonElement>;
};

export function StringDatePickerInput({
    onChange,
    defaultValue,
    value,
    ...rest
}: StringDateTimePickerProps) {
    return (
        <DatePickerInput
            {...rest}
            onChange={
                onChange &&
                ((value) =>
                    onChange(value ? extractDateStringFromJSDate(value) : null))
            }
            defaultValue={
                defaultValue
                    ? DateTime.fromISO(defaultValue).toJSDate()
                    : undefined
            }
            value={value ? DateTime.fromISO(value).toJSDate() : undefined}
        />
    );
}
