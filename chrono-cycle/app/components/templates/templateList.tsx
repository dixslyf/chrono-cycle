"use client";

import AddTemplateButton from "./addTemplateButton";
import React, { useState, useActionState, useEffect } from "react";
import { X } from "lucide-react";
import { createProjectTemplate } from "@/server/project-templates/create/action";
import { listProjectTemplates } from "@/server/project-templates/list/action";
import { ListProjectTemplatesResult } from "@/server/project-templates/list/data";

const TemplateList = () => {
    const [formState, formAction, _formPending] = useActionState(
        createProjectTemplate,
        { submitSuccess: false },
    );

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const toggleModal = () => {
        setIsModalOpen((prev) => !prev);
    };

    useEffect(() => {
        if (formState.submitSuccess) {
            setIsModalOpen(false);
        }
    }, [formState]);

    // Project templates list.
    const [listProjectTemplatesResult, setListProjectTemplatesResult] =
        useState<ListProjectTemplatesResult | null>();

    // Fetch the project templates on load.
    useEffect(() => {
        listProjectTemplates().then((result) =>
            setListProjectTemplatesResult(result),
        );
    }, []);

    // Append the created project template to the list if successfully created.
    useEffect(() => {
        const updated = Object.assign({}, listProjectTemplatesResult);
        if (!formState.createdProjectTemplate || !updated?.projectTemplates) {
            return;
        }

        // Append created project template to list.
        updated.projectTemplates = [
            ...updated.projectTemplates,
            formState.createdProjectTemplate,
        ];
        setListProjectTemplatesResult(updated);
    }, [formState, listProjectTemplatesResult]);

    return (
        <>
            {/* List of project templates. */}
            <div>
                {!listProjectTemplatesResult?.success
                    ? listProjectTemplatesResult?.errorMessage
                    : listProjectTemplatesResult?.projectTemplates?.map(
                        (info) => (
                            <div key={info.name} className="flex gap-4">
                                <div>Name: {info.name}</div>
                                <div>Description: {info.description}</div>
                                <div>
                                    Created at: {info.createdAt.toString()}
                                </div>
                                <div>
                                    Updated at: {info.updatedAt.toString()}
                                </div>
                            </div>
                        ),
                    )}
            </div>

            {/* add template button */}
            <AddTemplateButton toggleModal={toggleModal} />

            {/* template creation modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
                    {/* modal container */}
                    <div className="relative shadow-lg w-4/5 z-10 bg-palette3">
                        {/* template form */}
                        <form action={formAction}>
                            {/* title and close button */}
                            <div>
                                {/* title input */}
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    placeholder="Project template name"
                                />

                                <button onClick={toggleModal}>
                                    <X />
                                </button>
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
                    </div>
                </div>
            )}
        </>
    );
};

export default TemplateList;
