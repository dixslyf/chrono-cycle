const projectTemplateKeys = {
    base: ["project-templates"] as const,

    list: () => [projectTemplateKeys.base, "list"] as const,

    retrieveBase: () => [projectTemplateKeys.base, "retrieve"] as const,
    retrieve: (projectTemplateId: string | null) =>
        [...projectTemplateKeys.retrieveBase(), projectTemplateId] as const,
};

const projectKeys = {
    base: ["projects"] as const,

    listAll: () => [projectKeys.base, "list-all"] as const,

    retrieveProjectTemplateBase: () =>
        [projectKeys.base, "retrieve-project-template"] as const,
    retrieveProjectTemplate: (projectId: string | null) =>
        [...projectKeys.retrieveProjectTemplateBase(), projectId] as const,
};

export const queryKeys = {
    projectTemplates: projectTemplateKeys,
    projects: projectKeys,
};
