"use client";

import { Button, useModalsStack } from "@mantine/core";
import { CalendarPlus } from "lucide-react";

import { CreateEventTemplateFormModal } from "./createEventTemplateForm";

export function CreateEventTemplateButton<T extends string>({
    projectTemplateId,
    modalStack,
}: {
    projectTemplateId: string;
    modalStack: ReturnType<typeof useModalsStack<"add-event" | T>>;
}) {
    return (
        <>
            <CreateEventTemplateFormModal
                modalStack={modalStack}
                projectTemplateId={projectTemplateId}
            />
            <Button
                className="text-palette3 hover:text-palette3 bg-palette2 hover:bg-palette1 transition-colors duration-300 ease-in"
                onClick={() => modalStack.open("add-event")}
            >
                <CalendarPlus className="mr-2" /> Add Event
            </Button>
        </>
    );
}
