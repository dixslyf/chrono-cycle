"use client";

import {
    ActionIcon,
    Button,
    FileButton,
    Group,
    Menu,
    Modal,
    Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { ChevronUp, Copy, Upload } from "lucide-react";
import { useState } from "react";

import splitButtonClasses from "@/app/split-button.module.css";
import { notifyError } from "@/app/utils/notifications";
import { listProjectTemplatesOptions } from "@/app/utils/queries/listProjectTemplates";

import {
    Payload as ImportPayload,
    payloadSchema as importPayloadSchema,
} from "@/features/project-templates/import/data";

import { CreateProjectTemplateForm } from "./createProjectTemplateForm";
import { DuplicateProjectTemplateForm } from "./duplicateProjectTemplateForm";
import { ImportProjectTemplateForm } from "./importProjectTemplateForm";

export function CreateProjectTemplateButton() {
    // Modal disclosures.
    const [createOpened, { open: openCreate, close: closeCreate }] =
        useDisclosure(false);
    const [importOpened, { open: openImport, close: closeImport }] =
        useDisclosure(false);
    const [duplicateOpened, { open: openDuplicate, close: closeDuplicate }] =
        useDisclosure(false);

    // For importing.
    const [importData, setImportData] = useState<ImportPayload | null>(null);
    function fileOnChange(newFile: File | null) {
        if (!newFile) {
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            try {
                const json = JSON.parse(reader.result as string);
                const importData = importPayloadSchema.parse(json);
                setImportData(importData);
                openImport();
            } catch (_err) {
                notifyError({ message: "Invalid project template file!" });
            }
        };
        reader.onerror = () => notifyError({ message: "Failed to read file!" });
        reader.readAsText(newFile);
    }

    // Query to fetch the list of project templates for duplicating a project template.
    const listPtsQuery = useQuery({
        ...listProjectTemplatesOptions({
            onError: closeDuplicate,
        }),
        enabled: false,
    });

    // On-click handler for the Duplicate button.
    async function onClickDuplicate() {
        openDuplicate();
        const result = await listPtsQuery.refetch();
        if (result.data && result.data.length === 0) {
            notifyError({
                message: "No project templates to duplicate.",
            });
            closeDuplicate();
        }
    }

    return (
        <>
            <Modal
                opened={createOpened}
                onClose={closeCreate}
                centered
                size="100%"
                padding={0}
                withCloseButton={false}
                radius="xl"
            >
                <CreateProjectTemplateForm onSuccess={closeCreate} />
            </Modal>
            <Modal
                opened={importOpened}
                onClose={closeImport}
                title="Import Project Template"
                centered
            >
                <ImportProjectTemplateForm
                    importData={importData ?? undefined}
                    onSuccess={closeImport}
                />
            </Modal>
            <Modal
                opened={duplicateOpened}
                onClose={closeDuplicate}
                title="Duplicate Project Template"
                centered
            >
                <DuplicateProjectTemplateForm
                    projectTemplates={listPtsQuery.data}
                    isPendingProjectTemplates={listPtsQuery.isPending}
                    onSuccess={closeDuplicate}
                />
            </Modal>
            {/* Based on: https://ui.mantine.dev/category/buttons/#split-button */}
            <Group wrap="nowrap" gap={0}>
                <Button
                    className={splitButtonClasses.button}
                    onClick={openCreate}
                >
                    Create
                </Button>
                {/* keepMounted is required for FileButton to work correctly.
                    See: https://help.mantine.dev/q/file-button-in-menu */}
                <Menu position="top-end" keepMounted withinPortal>
                    <Menu.Target>
                        <ActionIcon
                            size={36}
                            className={splitButtonClasses.menuControl}
                        >
                            <ChevronUp />
                        </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                        <FileButton
                            onChange={fileOnChange}
                            accept="application/json"
                        >
                            {(props) => (
                                <Menu.Item leftSection={<Upload />} {...props}>
                                    Import
                                </Menu.Item>
                            )}
                        </FileButton>
                        <Menu.Item
                            leftSection={<Copy />}
                            onClick={onClickDuplicate}
                        >
                            Duplicate
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Group>
        </>
    );
}
