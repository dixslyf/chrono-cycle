import { TextInput, type TextInputProps } from "@mantine/core";

export function AuthTextInput(props: TextInputProps) {
    return (
        <TextInput
            classNames={{
                root: "flex flex-col w-3/4",
                label: "text-base text-palette5 pl-1 pb-2",
                required: "text-red-600",
                error: "text-sm text-red-600 pl-1",
                wrapper: "w-full outline-none outline-hidden",
                input: "w-full rounded-xl bg-[#dfdfdf] placeholder-[#989898] p-1 pl-2 focus:outline-none focus:border-[#949494] focus:ring-[#949494] focus:ring-1",
            }}
            unstyled
            {...props}
        />
    );
}
