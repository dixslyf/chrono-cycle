"use client";

import { Button, Modal, useModalsStack } from "@mantine/core";
import { CreateEventTemplateForm } from "./createEventForm";
import { CalendarPlus } from "lucide-react";

export function CreateEventTemplateButton<T extends string>({
    projectTemplateId,
    modalStack,
}: {
    projectTemplateId: string;
    modalStack: ReturnType<typeof useModalsStack<"add-event" | T>>;
}) {
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
                    onSuccess={() => modalStack.close("add-event")}
                />
            </Modal>
            <Button
                variant="filled"
                onClick={() => modalStack.open("add-event")}
            >
                <CalendarPlus className="mr-2" /> Add Event
            </Button>
        </>
    );
}
