"use client";

import { Box, Group, Modal, Stack, type ModalProps } from "@mantine/core";
import { ReactNode } from "react";

import classes from "./split-modal.module.css";

const SECTION_PX = 36;
const SECTION_PY = 24;

export type SplitModalProps = Omit<ModalProps, "withCloseButton" | "title">;

export function SplitModal(props: SplitModalProps): ReactNode {
    const { children, ...passedProps } = props;
    return (
        <Modal
            centered
            size="100%"
            radius="xl"
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

function SplitModalLeft(props: { title?: string; children: ReactNode }) {
    return (
        <Box px={SECTION_PX} py={SECTION_PY} style={{ flex: 2 }}>
            {props.children}
        </Box>
    );
}

function SplitModalRight(props: { children: ReactNode }) {
    return (
        <Stack gap={0} className="bg-palette1">
            <Group justify="flex-end" px={20} py={16} style={{ flex: 1 }}>
                <Modal.CloseButton
                    iconSize={30}
                    style={{
                        color: "var(--mantine-color-white)",
                    }}
                    className={classes.closeButton}
                />
            </Group>
            <Box h="100%" w="100%" px={SECTION_PX} py={SECTION_PY}>
                {props.children}
            </Box>
        </Stack>
    );
}

SplitModal.Left = SplitModalLeft;
SplitModal.Right = SplitModalRight;
