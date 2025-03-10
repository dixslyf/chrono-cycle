"use client";

import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Plus } from "lucide-react";

import { CreateProjectTemplateForm } from "./createTemplateForm";

export function CreateProjectTemplateButton() {
    const [opened, { open, close }] = useDisclosure(false);
    return (
        <>
            <Modal
                opened={opened}
                onClose={close}
                title="Create Project Template"
                centered
            >
                <CreateProjectTemplateForm onSuccess={close} />
            </Modal>
            <Button variant="filled" onClick={open}>
                <Plus />
            </Button>
        </>
    );
}
