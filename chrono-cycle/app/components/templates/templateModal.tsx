"use client";

import React, { startTransition, useEffect, useState } from "react";
import { Trash, ArrowLeft } from "lucide-react";
import { match, P } from "ts-pattern";
import { CreateResult } from "@/server/project-templates/create/data";
import { DeleteResult } from "@/server/project-templates/delete/data";
import {
    Input,
    Textarea,
    DialogRoot,
    DialogContent,
    DialogHeader,
    DialogBody,
    DialogFooter,
    DialogCloseTrigger,
    Button,
    Portal,
} from "@chakra-ui/react";
import { ValidationIssues } from "@/server/common/errors";
import { ProjectTemplateOverview } from "@/server/project-templates/common/data";
import EventTable from "./eventTable";

interface EventItem {
    name: string;
    duration: string;
    description?: string;
}

interface TemplateModelProps {
    modalMode: "create" | "view";
    isOpen: boolean;
    toggleModal: () => void;
    selectedTemplate: ProjectTemplateOverview | null;
    createState: CreateResult | null;
    createAction: (FormData: FormData) => void;
    deleteState: DeleteResult | null;
    handleDelete: () => void;
}

function getCreateErrorMessage(createState: CreateResult) {
    return match(createState)
        .with(
            { left: { _errorKind: "ValidationError" } },
            () => "Invalid or missing fields",
        )
        .with(
            { left: { _errorKind: "DuplicateNameError" } },
            () => "Project tempalte name is already used",
        )
        .with({ right: P.any }, () => "")
        .exhaustive();
}

function extractValidationIssues(
    createState: CreateResult | null,
): ValidationIssues<"name" | "description"> {
    const noIssue = { name: [], description: [] };
    if (!createState) {
        return noIssue;
    }

    return match(createState)
        .with(
            {
                _tag: "Left",
                left: { _errorKind: "ValidationError", issues: P.select() },
            },
            (issues) => issues,
        )
        .otherwise(() => noIssue);
}

function TemplateModel({
    modalMode,
    isOpen,
    toggleModal,
    selectedTemplate,
    createState,
    createAction,
    handleDelete,
}: TemplateModelProps) {
    const [formData, setFormData] = useState<{ [key: string]: string }>({
        name: selectedTemplate?.name || "",
        description: selectedTemplate?.description || "",
    });

    const [currentSubView, setCurrentSubView] = useState<
        "template" | "eventDetails"
    >("template");

    const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
    // use eventData to manage editing in event view
    const [eventData, setEventData] = useState<EventItem | null>(null);

    // model open, sync form data with selected template
    useEffect(() => {
        if (modalMode === "view" && selectedTemplate) {
            setFormData({
                name: selectedTemplate.name,
                description: selectedTemplate.description,
            });
        }
    }, [selectedTemplate, modalMode, isOpen]);

    // sync eventDate with selectedEvent when change
    useEffect(() => {
        if (selectedEvent) {
            setEventData(selectedEvent);
        }
    }, [selectedEvent]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // auto save on close
    const handleClose = () => {
        if (modalMode === "view") {
            // TODO
            // handle auto save here
        }
        setCurrentSubView("template");
        toggleModal();
    };

    // callback to go back to tempalte view from event
    const handleBackToTemplate = () => {
        setCurrentSubView("template");
        setSelectedEvent(null);
    };

    const handleEventChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setEventData((prev) => (prev ? { ...prev, [name]: value } : null));
    };

    return (
        <DialogRoot
            lazyMount
            open={isOpen}
            onOpenChange={handleClose}
            placement="center"
        >
            {isOpen && (
                <Portal>
                    <div className="fixed inset-0 bg-black opacity-50 z-[9998]" />
                </Portal>
            )}
            <DialogContent className="bg-palette3 fixed right-0 left-0 z-[9999]">
                <DialogHeader>
                    {currentSubView === "template"
                        ? modalMode === "create"
                            ? "Create Template"
                            : "Template Details"
                        : "Event Details"}
                </DialogHeader>
                <DialogBody>
                    {currentSubView === "template" ? (
                        modalMode === "create" ? (
                            <form
                                // this part uses onSubmit to be able to toggle the modal
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const formData = new FormData(
                                        e.currentTarget,
                                    );
                                    startTransition(() => {
                                        createAction(formData);
                                    });
                                    toggleModal();
                                }}
                            >
                                <div className="mb-4">
                                    <Input
                                        variant="outline"
                                        placeholder="Project template name"
                                        id="name"
                                        name="name"
                                        className="bg-palette3"
                                    />
                                </div>
                                <div>
                                    <Textarea
                                        variant="outline"
                                        placeholder="Add description"
                                        id="description"
                                        name="description"
                                        className="bg-palette3"
                                    />
                                </div>
                                <div className="relative mb-4">
                                    <ul className="text-red-500">
                                        {createState &&
                                            getCreateErrorMessage(createState)}
                                        {Object.entries(
                                            extractValidationIssues(
                                                createState,
                                            ),
                                        ).flatMap(([fieldName, errors]) =>
                                            errors.map((err, idx) => (
                                                <li
                                                    key={`${fieldName}-${idx}`}
                                                    className="px-4 py-3"
                                                >
                                                    {err || ""}
                                                </li>
                                            )),
                                        )}
                                    </ul>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" colorScheme="blue">
                                        Create Template
                                    </Button>
                                </DialogFooter>
                            </form>
                        ) : (
                            <div>
                                <div className="mb-4">
                                    <Input
                                        variant="outline"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="bg-palette3"
                                    />
                                </div>
                                <div className="mb-4">
                                    <Textarea
                                        variant="outline"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        className="bg-palette3"
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="font-semibold">
                                        Created At:
                                    </label>
                                    <div>
                                        {selectedTemplate?.createdAt.toString()}
                                    </div>
                                </div>
                                <div className="mb-4">
                                    <label className="font-semibold">
                                        Updated At:
                                    </label>
                                    <div>
                                        {selectedTemplate?.updatedAt.toString()}
                                    </div>
                                </div>
                                {/* Render the EventTable and pass a row click callback */}
                                <div>
                                    <label className="font-semibold">
                                        Events:
                                    </label>
                                    <EventTable
                                        onRowClick={(event) => {
                                            setSelectedEvent(event);
                                            setCurrentSubView("eventDetails");
                                        }}
                                    />
                                </div>
                            </div>
                        )
                    ) : (
                        // Event Details View
                        <div>
                            {eventData && (
                                <div>
                                    <div className="mb-4">
                                        <label className="block font-bold">
                                            Event Name:
                                        </label>
                                        <Input
                                            variant="outline"
                                            name="name"
                                            value={eventData.name}
                                            onChange={handleEventChange}
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block font-bold">
                                            Duration:
                                        </label>
                                        <Input
                                            variant="outline"
                                            name="duration"
                                            value={eventData.duration}
                                            onChange={handleEventChange}
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block font-bold">
                                            Description:
                                        </label>
                                        <Textarea
                                            variant="outline"
                                            name="description"
                                            value={eventData.description || ""}
                                            onChange={handleEventChange}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </DialogBody>
                <DialogFooter>
                    {currentSubView === "eventDetails" ? (
                        // Show the back button when in event details view
                        <Button
                            variant="outline"
                            onClick={handleBackToTemplate}
                        >
                            <ArrowLeft />
                            Back
                        </Button>
                    ) : (
                        modalMode === "view" && (
                            <Button
                                onClick={handleDelete}
                                className="flex items-center"
                            >
                                <Trash className="mr-2" />
                                Delete
                            </Button>
                        )
                    )}
                    <DialogCloseTrigger asChild>
                        <Button variant="outline">Close</Button>
                    </DialogCloseTrigger>
                </DialogFooter>
            </DialogContent>
        </DialogRoot>
    );
}

export default TemplateModel;
