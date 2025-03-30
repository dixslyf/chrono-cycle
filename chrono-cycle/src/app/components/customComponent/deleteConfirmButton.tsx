"use client";

import { Button, Group, Modal, Text } from "@mantine/core";
import { Trash } from "lucide-react";
import { useState } from "react";

import { CriticalButton } from "./criticalButton";

interface DeleteConfirmButtonProps {
    onDelete: () => void;
    itemType: string;
    disabled?: boolean;
    loading?: boolean;
}

export function DeleteConfirmButton({
    onDelete,
    itemType,
    disabled = false,
    loading = false,
}: DeleteConfirmButtonProps): React.ReactNode {
    const [opened, setOpened] = useState(false);

    const handleConfirm = () => {
        setOpened(false);
        onDelete();
    };

    return (
        <>
            <CriticalButton
                disabled={disabled}
                loading={loading}
                leftSection={<Trash />}
                onClick={() => setOpened(true)}
            >
                Delete
            </CriticalButton>

            <Modal
                opened={opened}
                onClose={() => setOpened(false)}
                title="Confirm Deletion"
                centered
                size="sm"
                zIndex={9999}
            >
                <Text size="sm" mb="lg">
                    Are you sure you want to delete this {itemType}? This action
                    cannot be undone.
                </Text>
                <Group justify="flex-end" mt="md">
                    <Button variant="default" onClick={() => setOpened(false)}>
                        Cancel
                    </Button>
                    <CriticalButton onClick={handleConfirm} loading={loading}>
                        Delete
                    </CriticalButton>
                </Group>
            </Modal>
        </>
    );
}
