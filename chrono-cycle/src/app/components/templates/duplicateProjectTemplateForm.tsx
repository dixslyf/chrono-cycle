"use client";

import {
    Button,
    Group,
    Select,
    Skeleton,
    Stack,
    Textarea,
    TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import { zodResolver } from "mantine-form-zod-resolver";
import { match } from "ts-pattern";

import { notifyError, notifySuccess } from "@/app/utils/notifications";

import { ProjectTemplateOverview } from "@/common/data/domain";

import { duplicateProjectTemplateAction } from "@/features/project-templates/duplicate/action";
import {
    Failure,
    payloadSchema,
} from "@/features/project-templates/duplicate/data";

function extractFormIssues(failure: Failure): {
    name?: string;
    description?: string;
} {
    return match(failure)
        .with({ _errorKind: "ValidationError" }, (err) => err.issues)
        .with({ _errorKind: "DuplicateNameError" }, (_err) => ({
            name: "Project template name is already used",
        }))
        .otherwise(() => ({}));
}

export function DuplicateProjectTemplateForm({
    onSuccess,
    projectTemplates,
    isPendingProjectTemplates,
}: {
    onSuccess: () => void;
    projectTemplates?: ProjectTemplateOverview[];
    isPendingProjectTemplates?: boolean;
}): React.ReactNode {
    const form = useForm({
        mode: "uncontrolled",
        initialValues: {
            projectTemplateId: "",
            name: "",
            description: "",
        },
        validate: zodResolver(payloadSchema),
    });
    type FormValues = typeof form.values;

    const queryClient = useQueryClient();
    const duplicateMutation = useMutation({
        mutationFn: async (values: FormValues) => {
            const result = await duplicateProjectTemplateAction(values);
            return pipe(
                result,
                E.getOrElseW((err) => {
                    throw err;
                }),
            );
        },
        onSuccess: () => {
            notifySuccess({
                message: "Successfully duplicated project template.",
            });
            queryClient.invalidateQueries({
                queryKey: ["list-project-templates"],
            });
            onSuccess();
        },
        onError: (err: Failure) => {
            const validationIssues = extractFormIssues(err);
            form.setErrors(validationIssues);
            notifyError({
                message: "Failed to duplicate project template.",
            });
        },
    });

    return (
        <form
            onSubmit={form.onSubmit((values) =>
                duplicateMutation.mutate(values),
            )}
        >
            <Stack>
                <Skeleton visible={isPendingProjectTemplates}>
                    <Select
                        label="Project Template"
                        required
                        description="The project template to duplicate"
                        error="Invalid project template"
                        placeholder="Project template"
                        searchable
                        disabled={duplicateMutation.isPending}
                        data={projectTemplates?.map((pts) => ({
                            label: `${pts.name} (${pts.id})`,
                            value: pts.id,
                        }))}
                        {...form.getInputProps("projectTemplateId")}
                    />
                </Skeleton>
                <Skeleton visible={isPendingProjectTemplates}>
                    <TextInput
                        name="name"
                        label="Name"
                        required
                        description="Name of the new project template"
                        error="Invalid project template name"
                        placeholder="Project template name"
                        disabled={duplicateMutation.isPending}
                        {...form.getInputProps("name")}
                    />
                </Skeleton>
                <Skeleton visible={isPendingProjectTemplates}>
                    <Textarea
                        name="description"
                        label="Description"
                        required
                        description="A description of the new project template"
                        error="Invalid description"
                        placeholder="Add description"
                        disabled={duplicateMutation.isPending}
                        {...form.getInputProps("description")}
                    />
                </Skeleton>
                <Group justify="flex-end">
                    <Button
                        type="submit"
                        disabled={isPendingProjectTemplates}
                        loading={duplicateMutation.isPending}
                    >
                        Duplicate
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}
