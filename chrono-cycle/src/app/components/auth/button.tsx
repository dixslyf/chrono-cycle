import {
    Button,
    type ButtonProps,
    type PolymorphicComponentProps,
} from "@mantine/core";

export function AuthButton(
    props: PolymorphicComponentProps<"button", ButtonProps>,
) {
    return (
        <Button
            className="w-3/4 p-1 rounded-xl bg-palette2 hover:bg-[#a08368] transition duration-300 text-palette3"
            {...props}
        >
            {props.children}
        </Button>
    );
}
