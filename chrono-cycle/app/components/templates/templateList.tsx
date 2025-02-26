"use client";

import AddTemplateButton from "./addTemplateButton";
import React, {
    useState,
    useActionState,
    useEffect,
    startTransition,
} from "react";
import { Trash, X } from "lucide-react";
import { createProjectTemplate } from "@/server/project-templates/create/action";
import { ProjectTemplateBasicInfo } from "@/server/project-templates/list/data";
import { deleteProjectTemplateAction } from "@/server/project-templates/delete/action";

function TemplateList({ entries }: { entries: ProjectTemplateBasicInfo[] }) {
    // Action state for creating a project template.
    const [createFormState, createFormAction, _createFormPending] =
        useActionState(createProjectTemplate, { submitSuccess: false });

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
    const [deleteState, deleteAction, _deletePending] = useActionState(
        deleteProjectTemplateAction,
        { success: false },
    );

    const handleDelete = async () => {
        // Name is guaranteed to be a string.
        startTransition(() => deleteAction(selectedTemplate?.name as string));
    };

    // Close modal window on creation success.
    useEffect(() => {
        if (modalMode == "create" && createFormState.submitSuccess) {
            setIsModalOpen(false);
        }
    }, [createFormState, modalMode]);

    // Close modal window on deletion success.
    useEffect(() => {
        if (modalMode == "view" && deleteState.success) {
            setIsModalOpen(false);
        }
    }, [deleteState, modalMode]);

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
                            <form action={createFormAction}>
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
                                        {!createFormState.submitSuccess &&
                                            createFormState.errorMessage}
                                    </div>
                                    <div className="text-red">
                                        {!createFormState.submitSuccess &&
                                            createFormState.errors?.name}
                                    </div>
                                    <div className="text-red">
                                        {!createFormState.submitSuccess &&
                                            createFormState.errors?.description}
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
                                <div>
                                    {!deleteState.success &&
                                        deleteState.errorMessage}
                                </div>
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
