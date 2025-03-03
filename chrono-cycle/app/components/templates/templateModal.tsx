"use client";

import React, { useEffect, useState } from "react";
import { Trash } from "lucide-react";
import { match, P } from "ts-pattern";
import EventTable from "./eventTable";
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
} from "@chakra-ui/react";
import { ValidationIssues } from "@/server/common/errors";
import { ProjectTemplateOverview } from "@/server/project-templates/common/data";

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

function getDeleteErrorMessage(deleteState: DeleteResult) {
    return match(deleteState)
        .with(
            { left: { _errorKind: "DoesNotExistError" } },
            () => "Project template does not exist",
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
    deleteState,
    handleDelete,
}: TemplateModelProps) {
    // if (!isOpen) return null;

    const [formData, setFormData] = useState<{ [key: string]: string }>({
        name: selectedTemplate?.name || "",
        description: selectedTemplate?.description || "",
    });

    // model open, sync form data with selected template
    useEffect(() => {
        if (modalMode === "view" && selectedTemplate) {
            setFormData({
                name: selectedTemplate.name,
                description: selectedTemplate.description,
            });
        }
    }, [selectedTemplate, modalMode, isOpen]);

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
        toggleModal();
    };

    return (
        <DialogRoot lazyMount open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="bg-palette3">
                <DialogHeader>
                    {modalMode === "create"
                        ? "Create Template"
                        : "Template Details"}
                </DialogHeader>

                <DialogBody>
                    {modalMode === "create" ? (
                        <form action={createAction}>
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
                                    id="desciption"
                                    name="description"
                                    className="bg-palette3"
                                />
                            </div>
                            {/* Error display */}
                            <div className="relative mb-4">
                                <ul className="text-red-500">
                                    {createState &&
                                        getCreateErrorMessage(createState)}
                                    {Object.entries(
                                        extractValidationIssues(createState),
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
                                <Button type="submit">Create Template</Button>
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
                        </div>
                    )}
                </DialogBody>

                <DialogFooter>
                    {modalMode === "view" && (
                        <Button
                            onClick={handleDelete}
                            className="flex items-center"
                        >
                            <Trash className="mr-2" />
                            Delete
                        </Button>
                    )}
                </DialogFooter>
                <DialogCloseTrigger />
            </DialogContent>
        </DialogRoot>
    );
}

export default TemplateModel;
