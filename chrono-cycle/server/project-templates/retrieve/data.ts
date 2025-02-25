export type RetrieveProjectTemplateResult = {
    success: boolean;
    projectTemplate?: ProjectTemplateData;
    errorMessage?: string;
};

export type ProjectTemplateData = {
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    // TODO: Add more in the future (e.g., event data).
};
