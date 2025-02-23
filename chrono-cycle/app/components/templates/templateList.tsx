"use client";

import AddTemplateButton from "./addTemplateButton";
import { useState } from "react";
import { X } from "lucide-react";

const TemplateList = () => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

    const toggleModel = () => {
        setIsModalOpen((prev) => !prev);
    };

    return (
        <>
            {/* add template button */}
            <AddTemplateButton toggleModel={toggleModel} />

            {/* template creation modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
                    {/* modal container */}
                    <div className="relative shadow-lg w-4/5 z-10 bg-palette3">
                        <h2>Create a New Template</h2>
                        <button onClick={toggleModel}>
                            <X />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default TemplateList;
