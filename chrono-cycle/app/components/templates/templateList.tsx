"use client";

import AddTemplateButton from "./addTemplateButton";
import React, {
    useState,
    useActionState,
    useEffect,
    startTransition,
} from "react";
import * as E from "fp-ts/Either";
import { createProjectTemplateAction } from "@/server/project-templates/create/action";
import { deleteProjectTemplateAction } from "@/server/project-templates/delete/action";
import { ProjectTemplateOverview } from "@/server/project-templates/common/data";
import TemplateModel from "./templateModal";

function TemplateList({ entries }: { entries: ProjectTemplateOverview[] }) {
    // Action state for creating a project template.
    const [createState, createAction, _createPending] = useActionState(
        createProjectTemplateAction,
        null,
    );

    // modal state and mode
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    // modal mode with create and view modes
    const [modalMode, setModalMode] = useState<"create" | "view">("create");
    // selected template for view mode
    const [selectedTemplate, setSelectedTemplate] =
        useState<ProjectTemplateOverview | null>(null);

    const toggleModal = () => {
        setIsModalOpen((prev) => !prev);
    };

    // Template deletion.
    const [deleteState, deleteAction, _deletePending] = useActionState(
        deleteProjectTemplateAction,
        null,
    );

    const handleDelete = async () => {
        // Name is guaranteed to be a string.
        startTransition(() => deleteAction(selectedTemplate?.name as string));
    };

    // Close modal window on creation success.
    useEffect(() => {
        if (modalMode == "create" && createState && E.isRight(createState)) {
            setIsModalOpen(false);
        }
    }, [createState, modalMode]);

    // Close modal window on deletion success.
    useEffect(() => {
        if (modalMode == "view" && deleteState && E.isRight(deleteState)) {
            setIsModalOpen(false);
        }
    }, [deleteState, modalMode]);

    // handles clickable rows to view template
    const handleRowClick = (template: ProjectTemplateOverview) => {
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

            <TemplateModel
                modalMode={modalMode}
                isOpen={isModalOpen}
                toggleModal={toggleModal}
                selectedTemplate={selectedTemplate}
                createState={createState}
                createAction={createAction}
                deleteState={deleteState}
                handleDelete={handleDelete}
            />
        </>
    );
}

export default TemplateList;
