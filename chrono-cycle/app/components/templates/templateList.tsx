"use client";

import AddTemplateButton from "./addTemplateButton";
import React, { useState, useActionState, useEffect } from "react";
import { Trash, X } from "lucide-react";
import { createProjectTemplate } from "@/server/project-templates/create/action";
import { ProjectTemplateBasicInfo } from "@/server/project-templates/list/data";
import { deleteProjectTemplateAction } from "@/server/project-templates/delete/action";

function TemplateList({ entries }: { entries: ProjectTemplateBasicInfo[] }) {
    const [formState, formAction, _formPending] = useActionState(
        createProjectTemplate,
        { submitSuccess: false },
    );

    // modal state and mode
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    // modal mode with create and view modes
    const [modalMode, setModalMode] = useState<"create" | "view">("create");
    // selected template for view mode
    const [selectedTemplate, setSelectedTemplate] =
        useState<ProjectTemplateBasicInfo | null>(null);

    const toggleModal = () => {
        setIsModalOpen((prev) => !prev);
    };

    // Template deletion.
    const [deleteErrorMessage, setDeleteErrorMessage] = useState<string>("");
    const handleDelete = async () => {
        const result = await deleteProjectTemplateAction(
            selectedTemplate?.name as string, // selectedTemplate shouldn't be null.
        );

        if (!result.success) {
            setDeleteErrorMessage(result.errorMessage as string); // Guaranteed to be a string.
            return;
        }

        // Close the modal window.
        setIsModalOpen(false);
    };

    // Close modal window on creation success.
    useEffect(() => {
        if (modalMode == "create" && formState.submitSuccess) {
            setIsModalOpen(false);
        }
    }, [formState, modalMode]);

    // handles clickable rows to view template
    const handleRowClick = (template: ProjectTemplateBasicInfo) => {
        setModalMode("view");
        setSelectedTemplate(template);
        setIsModalOpen(true);
    };

    // handle clicking add template button
    const handleNewTemplate = () => {
        setModalMode("create");
        setSelectedTemplate(null);
        setIsModalOpen(true);
    };

    return (
        <>
            {/* List of project templates. */}
            <div>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Created At</th>
                            <th>Updated At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map((info) => (
                            <tr
                                key={info.name}
                                className="cursor-pointer"
                                onClick={() => handleRowClick(info)}
                            >
                                <td>{info.name}</td>
                                <td>{info.description}</td>
                                <td>{info.createdAt.toString()}</td>
                                <td>{info.updatedAt.toString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* add template button */}
            <AddTemplateButton toggleModal={handleNewTemplate} />

            {/* template creation modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
                    {/* modal container */}
                    <div className="relative shadow-lg w-4/5 z-10 bg-palette3">
                        <div>
                            <h2>
                                {modalMode === "create"
                                    ? "Create Template"
                                    : "Template Details"}
                            </h2>
                            <button onClick={toggleModal} type="button">
                                <X />
                            </button>
                        </div>
                        {modalMode === "create" ? (
                            <form action={formAction}>
                                {/* template form */}
                                {/* title and close button */}
                                <div>
                                    {/* title input */}
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        placeholder="Project template name"
                                    />
                                </div>
                                <div>
                                    {/* description input */}
                                    <textarea
                                        name="description"
                                        id="description"
                                        placeholder="Add description"
                                    />
                                </div>
                                <div>
                                    {/* FIXME: Dumping errors here for now. */}
                                    <div className="text-red">
                                        {!formState.submitSuccess &&
                                            formState.errorMessage}
                                    </div>
                                    <div className="text-red">
                                        {!formState.submitSuccess &&
                                            formState.errors?.name}
                                    </div>
                                    <div className="text-red">
                                        {!formState.submitSuccess &&
                                            formState.errors?.description}
                                    </div>
                                </div>
                                <button type="submit">Create Template</button>
                            </form>
                        ) : (
                            <div>
                                <div>
                                    <label>Name:</label>
                                    <div>{selectedTemplate?.name}</div>
                                </div>
                                <div>
                                    <label>Description:</label>
                                    <div>{selectedTemplate?.description}</div>
                                </div>
                                <div>
                                    <label>Created AT:</label>
                                    <div>
                                        {selectedTemplate?.createdAt.toString()}
                                    </div>
                                </div>
                                <div>
                                    <label>Updated At:</label>
                                    <div>
                                        {selectedTemplate?.updatedAt.toString()}
                                    </div>
                                </div>

                                {/* Deletion. */}
                                <div>{deleteErrorMessage}</div>
                                <button onClick={() => handleDelete()}>
                                    <Trash />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default TemplateList;
