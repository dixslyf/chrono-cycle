"use client";

import { Box, Group, Modal, Stack, type ModalProps } from "@mantine/core";
import { ReactNode } from "react";

export function SingleModal({ children, ...props }: ModalProps): ReactNode {
    return (
        <Modal
            centered
            size="60%"
            radius="xl"
            withCloseButton={false}
            padding="md"
            {...props}
            styles={{
                content: {
                    height: "auto",
                },
            }}
        >
            <Stack gap={0} className="w-full h-full items-stretch">
                <Group justify="flex-end" px={20} style={{ flex: 1 }}>
                    <Modal.CloseButton
                        iconSize={30}
                        style={{
                            color: "var(--mantine-color-black)",
                        }}
                        onClick={props.onClose}
                    />
                </Group>
                <Box h="100%" w="100%">
                    {children}
                </Box>
            </Stack>
        </Modal>
    );
}
