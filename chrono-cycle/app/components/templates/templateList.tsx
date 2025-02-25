"use client";

import AddTemplateButton from "./addTemplateButton";
import React, { useState, useActionState } from "react";
import { X } from "lucide-react";
import { createProjectTemplate } from "@/server/project-templates/create/action";

const TemplateList = () => {
    const [formState, formAction, _formPending] = useActionState(
        createProjectTemplate,
        { submitSuccess: false },
    );

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const toggleModal = () => {
        setIsModalOpen((prev) => !prev);
    };

    return (
        <>
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
