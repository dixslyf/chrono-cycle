"use client";

import { Button, useModalsStack } from "@mantine/core";
import { CalendarPlus } from "lucide-react";
import { useCallback } from "react";

import { SplitModal } from "@/app/components/customComponent/splitModal";

import {
    CreateEventTemplateFormLeft,
    CreateEventTemplateFormRight,
    CreateEventTemplateFormState,
} from "./createEventTemplateForm";

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

    const { form, mutation, isTask } = CreateEventTemplateFormState({
        projectTemplateId,
        onSuccess: closeModal,
    });

    return (
        <>
            <SplitModal {...modalStack.register("add-event")}>
                <SplitModal.Left title="Create Event Template">
                    <CreateEventTemplateFormLeft
                        form={form}
                        mutation={mutation}
                        isTask={isTask}
                    />
                </SplitModal.Left>
                <SplitModal.Right title="Reminders">
                    <CreateEventTemplateFormRight
                        form={form}
                        mutation={mutation}
                    />
                </SplitModal.Right>
            </SplitModal>
            <Button
                className="text-palette3 hover:text-palette3 bg-palette2 hover:bg-palette1 transition-colors duration-300 ease-in"
                onClick={openModal}
            >
                <CalendarPlus className="mr-2" /> Add Event
            </Button>
        </>
    );
}
