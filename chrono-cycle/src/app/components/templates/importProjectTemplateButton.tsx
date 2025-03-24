"use client";

import { Button, FileButton, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";

import { notifyError } from "@/app/utils/notifications";

import {
    Payload,
    payloadSchema,
} from "@/features/project-templates/import/data";

import { ImportProjectTemplateForm } from "./importProjectTemplateForm";

export function ImportProjectTemplateButton() {
    const [opened, { open: openModal, close: closeModal }] =
        useDisclosure(false);
    const [importData, setImportData] = useState<Payload | null>(null);
    function fileOnChange(newFile: File | null) {
        if (!newFile) {
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            try {
                const json = JSON.parse(reader.result as string);
                const importData = payloadSchema.parse(json);
                setImportData(importData);
                openModal();
            } catch (_err) {
                notifyError({ message: "Invalid project template file!" });
            }
        };

        reader.onerror = () => notifyError({ message: "Failed to read file!" });

        reader.readAsText(newFile);
    }

    return (
        <>
            <Modal
                opened={opened}
                onClose={closeModal}
                title="Import Project Template"
                centered
            >
                <ImportProjectTemplateForm
                    importData={importData ?? undefined}
                    onSuccess={closeModal}
                />
            </Modal>
            <FileButton onChange={fileOnChange} accept="application/json">
                {(props) => (
                    <Button variant="filled" {...props}>
                        Import
                    </Button>
                )}
            </FileButton>
        </>
    );
}
