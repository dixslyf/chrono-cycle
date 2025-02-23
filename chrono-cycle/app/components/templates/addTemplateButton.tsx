"use client";

import { Plus } from "lucide-react";

interface TemplateProps {
    toggleModel: () => void;
}

const AddTemplateButton: React.FC<TemplateProps> = ({ toggleModel }) => {
    return (
        <>
            <button
                onClick={toggleModel}
                className="flex items-center justify-center w-full"
                type="button"
            >
                <hr className="flex-grow border-gray-300" />
                <Plus className="mx-4" />
                <hr className="flex-grow border-gray-300" />
            </button>
        </>
    );
};

export default AddTemplateButton;
