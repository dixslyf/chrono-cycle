"use client";

import AddTemplateButton from "./addTemplateButton";
import React, { useEffect, useState } from "react";
import { X, History, Tag } from "lucide-react";

const TemplateList = () => {
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    // TODO
    // use the setTags function to initialise tags
    const [tags, setTags] = useState<string[]>([]);

    const toggleModel = () => {
        setIsModalOpen((prev) => !prev);
    };

    // example tags
    useEffect(() => {
        setTags(["Urgent", "Home", "Work"]);
    }, []);

    // handle tag change
    const handleTageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selected = Array.from(
            e.target.selectedOptions,
            (option) => option.value,
        );
        setSelectedTags(selected);
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
                        {/* template form */}
                        <form action="">
                            {/* title and close button */}
                            <div>
                                {/* title input */}
                                <input
                                    type="text"
                                    name="title"
                                    id="title"
                                    placeholder="Task name"
                                />

                                <button onClick={toggleModel}>
                                    <X />
                                </button>
                            </div>
                            <div>
                                {/* description input */}
                                <textarea
                                    name="desc"
                                    id="desc"
                                    placeholder="Add description"
                                />

                                {/* duration */}
                                <div>
                                    <label htmlFor="duration">
                                        <History />
                                        Duration
                                    </label>
                                    {/* probably there is another to do this */}
                                    <input
                                        type="number"
                                        name="duration"
                                        id="duration"
                                        min={0}
                                    />
                                </div>

                                {/* tag */}
                                <div>
                                    <label htmlFor="tag">
                                        <Tag />
                                        Tags
                                    </label>
                                    <select
                                        name="tag"
                                        id="tag"
                                        multiple
                                        value={selectedTags}
                                        onChange={handleTageChange}
                                    >
                                        {selectedTags.length === 0 && (
                                            <option value="" disabled>
                                                Select tags
                                            </option>
                                        )}
                                        {tags.map((tag, index) => (
                                            <option value={tag} key={index}>
                                                {tag}
                                            </option>
                                        ))}
                                    </select>
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
