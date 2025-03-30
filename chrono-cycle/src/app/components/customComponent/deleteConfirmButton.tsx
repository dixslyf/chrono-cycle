"use client";

import {
    Button,
    Group,
    Modal,
    Stack,
    Text,
    useModalsStack,
} from "@mantine/core";
import { Trash } from "lucide-react";

import { CriticalButton } from "./criticalButton";
import { SingleModal } from "./singleModal";

interface DeleteConfirmButtonProps<
    ModalStackId extends string,
    OtherModalStackIds extends string,
> {
    modalStack: ReturnType<
        typeof useModalsStack<ModalStackId | OtherModalStackIds>
    >;
    modalStackId: ModalStackId;
    onDelete: () => void;
    itemType: string;
    disabled?: boolean;
    loading?: boolean;
}

export function DeleteConfirmButton<
    ModalStackId extends string,
    OtherModalStackIds extends string,
>({
    modalStack,
    modalStackId,
    onDelete,
    itemType,
    disabled = false,
    loading = false,
}: DeleteConfirmButtonProps<
    ModalStackId,
    OtherModalStackIds
>): React.ReactNode {
    const handleConfirm = () => {
        modalStack.close(modalStackId);
        onDelete();
    };

    return (
        <>
            <CriticalButton
                disabled={disabled}
                loading={loading}
                leftSection={<Trash />}
                onClick={() => modalStack.open(modalStackId)}
            >
                Delete
            </CriticalButton>

            <SingleModal
                title="Confirm Deletion"
                centered
                className="bg-red-100"
                {...modalStack.register(modalStackId)}
            >
                <Stack>
                    <Text>
                        Are you sure you want to delete this {itemType}?
                    </Text>
                    <Text fw="bold">This action cannot be undone.</Text>
                    <Group justify="flex-end" mt="md">
                        <Button
                            variant="default"
                            onClick={() => modalStack.close(modalStackId)}
                        >
                            Cancel
                        </Button>
                        <CriticalButton
                            onClick={handleConfirm}
                            loading={loading}
                        >
                            Delete
                        </CriticalButton>
                    </Group>
                </Stack>
            </SingleModal>
        </>
    );
}
