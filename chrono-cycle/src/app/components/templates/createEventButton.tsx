"use client";

import { Button, Modal, useModalsStack } from "@mantine/core";
import { CalendarPlus } from "lucide-react";
import { useCallback } from "react";

import { SplitModal } from "@/app/components/customComponent/splitModal";

// import { CreateEventTemplateForm } from "./createEventForm";
import {
    CreateEventTemplateFormLeft,
    CreateEventTemplateFormRight,
    CreateEventTemplateFormState,
} from "./createEventForm";

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

    const { form, mutation, durationDisabled } = CreateEventTemplateFormState({
        projectTemplateId: "add-event",
        onSuccess: closeModal,
    });

    return (
        <>
            <Modal.Stack>
                <SplitModal {...modalStack.register("add-event")}>
                    <SplitModal.Left>
                        <CreateEventTemplateFormLeft
                            form={form}
                            mutation={mutation}
                        />
                    </SplitModal.Left>
                    <SplitModal.Right>
                        <CreateEventTemplateFormRight
                            form={form}
                            mutation={mutation}
                            durationDisabled={durationDisabled}
                        />
                    </SplitModal.Right>
                </SplitModal>
            </Modal.Stack>
            <Button
                className="text-palette3 hover:text-palette3 bg-palette2 hover:bg-palette1 transition-colors duration-300 ease-in"
                onClick={openModal}
            >
                <CalendarPlus className="mr-2" /> Add Event
            </Button>
        </>
    );
}
