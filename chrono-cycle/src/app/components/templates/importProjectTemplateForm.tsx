"use client";

import { Button, Group, Stack, Textarea, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation } from "@tanstack/react-query";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import { zodResolver } from "mantine-form-zod-resolver";
import { match } from "ts-pattern";

import { notifyError, notifySuccess } from "@/app/utils/notifications";

import { importProjectTemplateAction } from "@/features/project-templates/import/action";
import {
    Failure,
    Payload,
    payloadSchema,
} from "@/features/project-templates/import/data";

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

export function ImportProjectTemplateForm({
    onSuccess,
    importData,
}: {
    onSuccess: () => void;
    importData?: Payload | undefined;
}): React.ReactNode {
    const form = useForm({
        mode: "uncontrolled",
        initialValues: {
            name: importData?.name ?? "",
            description: importData?.description ?? "",
        },
        validate: zodResolver(payloadSchema.omit({ events: true })),
    });
    type FormValues = typeof form.values;

    const importMutation = useMutation({
        mutationFn: async (values: FormValues) => {
            const result = await importProjectTemplateAction({
                ...values,
                events: importData?.events ?? [],
            });
            return pipe(
                result,
                E.getOrElseW((err) => {
                    throw err;
                }),
            );
        },
        onSuccess: () => {
            notifySuccess({
                message: "Successfully imported project template.",
            });
            onSuccess();
        },
        onError: (err: Failure) => {
            const validationIssues = extractFormIssues(err);
            form.setErrors(validationIssues);
            notifyError({
                message: "Failed to import project template.",
            });
        },
    });

    return (
        <Stack>
            <form
                onSubmit={form.onSubmit((values) =>
                    importMutation.mutate(values),
                )}
            >
                <Stack gap="xl">
                    <TextInput
                        size="md"
                        name="name"
                        label="Name"
                        required
                        description="Name of the new project template"
                        error="Invalid project template name"
                        placeholder="Project template name"
                        disabled={importMutation.isPending}
                        {...form.getInputProps("name")}
                    />
                    <Textarea
                        size="md"
                        name="description"
                        label="Description"
                        required
                        description="A description of the new project template"
                        error="Invalid description"
                        placeholder="Add description"
                        disabled={importMutation.isPending}
                        {...form.getInputProps("description")}
                    />
                    <Group justify="flex-end">
                        <Button
                            type="submit"
                            loading={importMutation.isPending}
                        >
                            Import
                        </Button>
                    </Group>
                </Stack>
            </form>
        </Stack>
    );
}
