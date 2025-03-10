"use client";

import React from "react";

interface ToggleProps {
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
}

const Toggle: React.FC<ToggleProps> = ({ checked, onChange, className }) => {
    return (
        <>
            <label
                className={`flex items-center cursor-pointer ${className || ""}`}
            >
                <div className="relative">
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={onChange}
                        className="sr-only peer"
                    />
                    {/* background */}
                    <div className="w-12 h-6 bg-palette5 rounded-full transition-colors duration-200 ease-in-out peer-checked:bg-palette2" />
                    <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full translate-transform duration-200 ease-in-out peer-checked:translate-x-6" />
                </div>
            </label>
        </>
    );
};

export default Toggle;
