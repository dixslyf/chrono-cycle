"use client";

import React from "react";
import { Trash } from "lucide-react";
import { match, P } from "ts-pattern";
import EventTable from "./eventTable";
import { CreateResult } from "@/server/project-templates/create/data";
import { DeleteResult } from "@/server/project-templates/delete/data";
import { Input, Textarea } from "@chakra-ui/react";
import { ValidationIssues } from "@/server/common/errors";
import { ProjectTemplateOverview } from "@/server/project-templates/common/data";
import ModalWrapper from "./modalWrapper";

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
    if (!isOpen) return null;

    return (
        <ModalWrapper
            isOpen={isOpen}
            toggleModal={toggleModal}
            title={
                modalMode === "create" ? "Create Template" : "Template Details"
            }
        >
            {modalMode === "create" ? (
                <form action={createAction}>
                    <div>
                        <Input
                            variant="subtle"
                            placeholder="Project template name"
                            id="name"
                            name="name"
                            className="bg-palette3"
                        />
                    </div>
                    <div>
                        <Textarea
                            variant="subtle"
                            placeholder="Add description"
                            id="description"
                            name="description"
                            className="bg-palette3"
                        />
                    </div>
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        {/* Error Display */}
                        {createState && getCreateErrorMessage(createState)}
                        <ul>
                            {Object.entries(
                                extractValidationIssues(createState),
                            ).flatMap(([fieldName, errors]) =>
                                errors.map((err, idx) => (
                                    <li key={`${fieldName}-${idx}`}>
                                        {err || ""}
                                    </li>
                                )),
                            )}
                        </ul>
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
                        <label>Created At:</label>
                        <div>{selectedTemplate?.createdAt.toString()}</div>
                    </div>
                    <div>
                        <label>Updated At:</label>
                        <div>{selectedTemplate?.updatedAt.toString()}</div>
                    </div>
                    <div>
                        <EventTable />
                    </div>
                    <div>
                        {deleteState &&
                            "Your delete error message handling here"}
                    </div>
                    <button
                        onClick={handleDelete}
                        className="hover:text-red-500 flex"
                    >
                        <Trash />
                        Delete
                    </button>
                </div>
            )}
        </ModalWrapper>
        // <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
        //     <div className="relative shadow-lg w-4/5 z-10 bg-palette3">
        //         {/* header wrapper */}
        //         <div>
        //             <h2>
        //                 {modalMode === "create"
        //                     ? "Create Template"
        //                     : "Tempalte Details"}
        //             </h2>
        //             <button onClick={toggleModal} type="button">
        //                 <X />
        //             </button>
        //         </div>
        //         {modalMode === "create" ? (
        //             <form action={createAction}>
        //                 <div>
        //                     <Input
        //                         variant="subtle"
        //                         placeholder="Project template name"
        //                         id="name"
        //                         name="name"
        //                         className="bg-palette3"
        //                     />
        //                 </div>
        //                 <div>
        //                     <Textarea
        //                         variant="subtle"
        //                         placeholder="Add description"
        //                         id="description"
        //                         name="description"
        //                         className="bg-palette3"
        //                     />
        //                 </div>
        //                 <div className="mb-2">
        //                     {/* Error Display */}
        //                     {createState && getCreateErrorMessage(createState)}
        //                     {Object.entries(
        //                         extractValidationIssues(createState),
        //                     ).flatMap(([fieldName, errors]) =>
        //                         errors.map((err, idx) => (
        //                             <span
        //                                 key={`${fieldName}-${idx}`}
        //                                 className="text-red-500"
        //                             >
        //                                 {err || ""}
        //                             </span>
        //                         )),
        //                     )}
        //                 </div>
        //                 <button type="submit">Create Template</button>
        //             </form>
        //         ) : (
        //             <div>
        //                 <div>
        //                     <label>Name:</label>
        //                     <div>{selectedTemplate?.name}</div>
        //                 </div>
        //                 <div>
        //                     <label>Description:</label>
        //                     <div>{selectedTemplate?.description}</div>
        //                 </div>
        //                 <div>
        //                     <label>Created AT:</label>
        //                     <div>{selectedTemplate?.createdAt.toString()}</div>
        //                 </div>
        //                 <div>
        //                     <label>Updated At:</label>
        //                     <div>{selectedTemplate?.updatedAt.toString()}</div>
        //                 </div>

        //                 <div>
        //                     <EventTable />
        //                 </div>

        //                 {/* Deletion. */}
        //                 <div>
        //                     {deleteState && getDeleteErrorMessage(deleteState)}
        //                 </div>
        //                 <button
        //                     onClick={() => handleDelete()}
        //                     className="hover:text-red-500 flex "
        //                 >
        //                     <Trash />
        //                     Delete
        //                 </button>
        //             </div>
        //         )}
        //     </div>
        // </div>
    );
}

export default TemplateModel;
