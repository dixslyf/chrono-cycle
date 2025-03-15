"use client";

import { Button, Modal, useModalsStack } from "@mantine/core";
import { useCallback } from "react";

import { CreateProjectForm } from "./createProjectForm";

export function CreateProjectButton<T extends string>({
    projectTemplateId,
    modalStack,
}: {
    projectTemplateId: string;
    modalStack: ReturnType<typeof useModalsStack<"create-project" | T>>;
}) {
    const { close: modalStackClose } = modalStack;
    const closeModal = useCallback(
        () => modalStackClose("create-project"),
        [modalStackClose],
    );

    return (
        <>
            <Modal
                title="Create Project"
                centered
                {...modalStack.register("create-project")}
            >
                <CreateProjectForm
                    projectTemplateId={projectTemplateId}
                    onSuccess={closeModal}
                />
            </Modal>
            <Button
                variant="filled"
                onClick={() => modalStack.open("create-project")}
            >
                New Project
            </Button>
        </>
    );
}
