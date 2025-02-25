export type ListProjectTemplatesResult = {
    success: boolean;
    projectTemplates?: ProjectTemplateBasicInfo[];
    errorMessage?: string;
};

export type ProjectTemplateBasicInfo = {
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
};
