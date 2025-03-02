import React from "react";
import { X } from "lucide-react";

interface ModalWrapperProps {
    isOpen: boolean;
    toggleModal: () => void;
    title: string;
    children: React.ReactNode;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({
    isOpen,
    toggleModal,
    title,
    children,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
            <div className="relative shadow-lg w-4/5">
                {/* header */}
                <div className="flex justify-between items-center p-4">
                    <h2 className="text-lg font-bold">{title}</h2>
                    <button onClick={toggleModal} type="button">
                        <X />
                    </button>
                </div>
                {/* content */}
                <div className="p-4">{children}</div>
            </div>
        </div>
    );
};

export default ModalWrapper;
