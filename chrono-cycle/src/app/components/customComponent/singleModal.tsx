"use client";

import { Box, Modal, type ModalProps } from "@mantine/core";
import { ReactNode } from "react";

export function SingleModal({ children, ...props }: ModalProps): ReactNode {
    return (
        <Modal
            centered
            radius="lg"
            styles={{
                header: { padding: 0 },
                title: { marginTop: 22, marginLeft: 30 },
                close: { marginTop: 24, marginRight: 16 },
                body: {
                    paddingLeft: 32,
                    paddingRight: 32,
                    paddingTop: 30,
                    paddingBottom: 24,
                },
                content: {
                    height: "auto",
                    padding: 0,
                },
            }}
            classNames={{
                header: "items-start",
                title: "text-2xl font-bold",
            }}
            closeButtonProps={{
                iconSize: 30,
                style: {
                    color: "var(--mantine-color-black)",
                },
            }}
            padding={0}
            {...props}
        >
            <Box h="100%" w="100%">
                {children}
            </Box>
        </Modal>
    );
}
