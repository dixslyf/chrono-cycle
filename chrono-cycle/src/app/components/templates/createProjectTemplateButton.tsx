"use client";

import {
    ActionIcon,
    Button,
    FileButton,
    Group,
    Menu,
    Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import { ChevronUp, Copy, Upload } from "lucide-react";
import { useState } from "react";

import { SingleModal } from "@/app/components/customComponent/singleModal";
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
            <SingleModal
                title="Create Project Template"
                opened={createOpened}
                onClose={closeCreate}
            >
                <CreateProjectTemplateForm onSuccess={closeCreate} />
            </SingleModal>
            <SingleModal
                title="Import Project Template"
                opened={importOpened}
                onClose={closeImport}
            >
                <ImportProjectTemplateForm
                    importData={importData ?? undefined}
                    onSuccess={closeImport}
                />
            </SingleModal>
            <SingleModal
                title="Duplicate Project Template"
                opened={duplicateOpened}
                onClose={closeDuplicate}
            >
                <DuplicateProjectTemplateForm
                    projectTemplates={listPtsQuery.data}
                    isPendingProjectTemplates={listPtsQuery.isPending}
                    onSuccess={closeDuplicate}
                />
            </SingleModal>
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
                    <Menu.Dropdown className="rounded-lg overflow-hidden shadow-lg p-0">
                        <Text className="px-4 py-2 font-semibold text-palette3 bg-palette2 border-b">
                            Template Actions
                        </Text>
                        <FileButton
                            onChange={fileOnChange}
                            accept="application/json"
                        >
                            {(props) => (
                                <Menu.Item
                                    leftSection={<Upload />}
                                    {...props}
                                    className="hover:bg-gray-200 transition-colors duration-200 ease-in"
                                >
                                    Import
                                </Menu.Item>
                            )}
                        </FileButton>
                        <Menu.Item
                            leftSection={<Copy />}
                            onClick={onClickDuplicate}
                            className="hover:bg-gray-200 transition-colors duration-200 ease-in"
                        >
                            Duplicate
                        </Menu.Item>
                    </Menu.Dropdown>
                </Menu>
            </Group>
        </>
    );
}
