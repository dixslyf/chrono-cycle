"use client";

import { Button, Modal, useModalsStack } from "@mantine/core";
import { CalendarPlus } from "lucide-react";
import { useCallback } from "react";

import { CreateEventTemplateForm } from "./createEventForm";

export function CreateEventTemplateButton<T extends string>({
    projectTemplateId,
    modalStack,
}: {
    projectTemplateId: string;
    modalStack: ReturnType<typeof useModalsStack<"add-event" | T>>;
}) {
    const { open: modalStackOpen, close: modalStackClose } = modalStack;
    const openModal = useCallback(
        () => modalStackOpen("add-event"),
        [modalStackOpen],
    );

    const closeModal = useCallback(
        () => modalStackClose("add-event"),
        [modalStackClose],
    );

    return (
        <>
            <Modal
                size="100%"
                radius="xl"
                withCloseButton={false}
                padding={0}
                centered
                {...modalStack.register("add-event")}
            >
                <CreateEventTemplateForm
                    projectTemplateId={projectTemplateId}
                    onSuccess={closeModal}
                    onClose={closeModal}
                />
            </Modal>
            <Button
                className="text-palette3 hover:text-palette3 bg-palette2 hover:bg-palette1 transition-colors duration-300 ease-in"
                onClick={openModal}
            >
                <CalendarPlus className="mr-2" /> Add Event
            </Button>
        </>
    );
}
