import { z } from "zod";

export const nameSchema = z
    .string()
    .nonempty("Please enter a name for the project template.");

export const descriptionSchema = z.string();

export const createProjectTemplateFormSchema = z.object({
    name: nameSchema,
    description: descriptionSchema,
});

export type CreateProjectTemplateFormData = z.output<
    typeof createProjectTemplateFormSchema
>;

export type CreateProjectTemplateFormErrors = {
    name?: string;
    description?: string;
};

export type CreateProjectTemplateFormState = {
    submitSuccess: boolean;
    errorMessage?: string;
    errors?: CreateProjectTemplateFormErrors;
};
