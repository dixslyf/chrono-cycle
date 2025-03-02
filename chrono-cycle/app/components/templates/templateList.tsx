"use client";

import AddTemplateButton from "./addTemplateButton";
import React, {
    useState,
    useActionState,
    useEffect,
    startTransition,
} from "react";
import { Trash, X } from "lucide-react";
import { match, P } from "ts-pattern";
import * as E from "fp-ts/Either";
import { createProjectTemplateAction } from "@/server/project-templates/create/action";
import { deleteProjectTemplateAction } from "@/server/project-templates/delete/action";
import { CreateResult } from "@/server/project-templates/create/data";
import { ValidationIssues } from "@/server/common/errors";
import { DeleteResult } from "@/server/project-templates/delete/data";
import { ProjectTemplateOverview } from "@/server/project-templates/common/data";

function getCreateErrorMessage(createState: CreateResult) {
    return match(createState)
        .with(
            { left: { _errorKind: "ValidationError" } },
            () => "Invalid or missing fields",
        )
        .with(
            { left: { _errorKind: "DuplicateNameError" } },
            () => "Project template name is already used",
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
                            <form action={createAction}>
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
                                    {createState &&
                                        getCreateErrorMessage(createState)}
                                    {Object.entries(
                                        extractValidationIssues(createState),
                                    ).map(([fieldName, errMsg]) => (
                                        <div
                                            key={fieldName}
                                            className="text-red"
                                        >
                                            {errMsg}
                                        </div>
                                    ))}
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
                                    {deleteState &&
                                        getDeleteErrorMessage(deleteState)}
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
