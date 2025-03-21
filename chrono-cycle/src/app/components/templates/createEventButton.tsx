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
                title="Add Event"
                size="xl"
                centered
                {...modalStack.register("add-event")}
            >
                <CreateEventTemplateForm
                    projectTemplateId={projectTemplateId}
                    onSuccess={closeModal}
                />
            </Modal>
            <Button
                variant="transparent"
                className="text-palette5 w-full hover:text-palette5"
                onClick={openModal}
            >
                <CalendarPlus className="mr-2" /> Add Event
            </Button>
        </>
    );
}
