import { TextInput, TextInputProps } from "@mantine/core";

export function EditableTitle(props: TextInputProps) {
    return (
        <TextInput
            variant="unstyled"
            classNames={{
                input: "text-3xl pt-4 pb-4 font-bold hover:bg-gray-200 focus:border focus:border-gray-400 focus:bg-gray-200",
            }}
            {...props}
        />
    );
}
