import {
    Button,
    type ButtonProps,
    type PolymorphicComponentProps,
} from "@mantine/core";

export function CriticalButton(
    props: PolymorphicComponentProps<"button", ButtonProps>,
) {
    return (
        <Button
            className="bg-red-500 hover:bg-red-600 transition-colors duration-300 text-palette3"
            {...props}
        >
            {props.children}
        </Button>
    );
}
