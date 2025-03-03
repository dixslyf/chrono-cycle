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
import { Table } from "@chakra-ui/react";

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
            {entries.length > 0 && (
                <Table.Root striped>
                    <Table.Header>
                        <Table.Row className="bg-palette3">
                            <Table.ColumnHeader className="text-palette5">
                                Name
                            </Table.ColumnHeader>
                            <Table.ColumnHeader className="text-palette5">
                                Description
                            </Table.ColumnHeader>
                            <Table.ColumnHeader className="text-palette5">
                                Created At
                            </Table.ColumnHeader>
                            <Table.ColumnHeader className="text-palette5">
                                Updated At
                            </Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {entries.map((info) => (
                            <Table.Row
                                key={info.name}
                                cursor="pointer"
                                onClick={() => handleRowClick(info)}
                                className="border-2 hover:bg-gray-500"
                            >
                                <Table.Cell className="bg-palette3">
                                    {info.name}
                                </Table.Cell>
                                <Table.Cell className="bg-palette3">
                                    {info.description}
                                </Table.Cell>
                                <Table.Cell className="bg-palette3">
                                    {info.createdAt.toString()}
                                </Table.Cell>
                                <Table.Cell className="bg-palette3">
                                    {info.updatedAt.toString()}
                                </Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table.Root>
            )}

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
