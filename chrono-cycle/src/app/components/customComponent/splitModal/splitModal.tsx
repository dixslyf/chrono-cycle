"use client";

import {
    Box,
    Group,
    Modal,
    Stack,
    StackProps,
    Text,
    type ModalProps,
} from "@mantine/core";
import { ReactNode } from "react";

import classes from "./split-modal.module.css";

const SECTION_PX = 30;
const SECTION_PY = 24;

export type SplitModalProps = Omit<ModalProps, "withCloseButton" | "title">;

export function SplitModal(props: SplitModalProps): ReactNode {
    const { children, ...passedProps } = props;
    return (
        <Modal
            centered
            size="100%"
            radius="lg"
            withCloseButton={false}
            padding={0}
            {...passedProps}
        >
            <Group gap={0} className="w-full h-full items-stretch">
                {children}
            </Group>
        </Modal>
    );
}

function SplitModalLeft(props: {
    title?: string;
    stackProps?: StackProps;
    flexRatio?: number;
    children: ReactNode;
}) {
    return (
        <Stack
            gap="xl"
            px={SECTION_PX}
            py={SECTION_PY}
            style={{ flex: props.flexRatio ?? 5 }}
            {...props.stackProps}
        >
            <Text className="text-3xl font-bold h-1/8">{props.title}</Text>
            <Box h="100%" w="100%">
                {props.children}
            </Box>
        </Stack>
    );
}

function SplitModalRight(props: {
    title?: string;
    stackProps?: StackProps;
    flexRatio?: number;
    children: ReactNode;
}) {
    return (
        <Stack
            gap="xl"
            style={{ flex: props.flexRatio ?? 3 }}
            className="bg-palette1"
            {...props.stackProps}
        >
            <Group justify="flex-end" align="flex-start">
                <Box pl={SECTION_PX} pt={SECTION_PY} style={{ flex: 1 }}>
                    <Text c="white" className="text-2xl font-bold h-1/8">
                        {props.title}
                    </Text>
                </Box>
                <Box pr={20} pt={16}>
                    <Modal.CloseButton
                        iconSize={30}
                        style={{
                            color: "var(--mantine-color-white)",
                        }}
                        className={classes.closeButton}
                    />
                </Box>
            </Group>
            <Box h="100%" w="100%" px={SECTION_PX} pb={SECTION_PY}>
                {props.children}
            </Box>
        </Stack>
    );
}

SplitModal.Left = SplitModalLeft;
SplitModal.Right = SplitModalRight;
