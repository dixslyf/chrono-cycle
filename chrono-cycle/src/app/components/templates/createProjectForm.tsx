"use client";

import { Button, Group, Textarea, TextInput } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import { zodResolver } from "mantine-form-zod-resolver";
import { match } from "ts-pattern";
import { z } from "zod";

import { notifyError, notifySuccess } from "@/app/utils/notifications";

import { createProjectAction } from "@/features/projects/create/action";
import { Failure, payloadSchema } from "@/features/projects/create/data";

function getCreateErrorMessage(error: Failure) {
    return match(error)
        .with(
            { _errorKind: "ValidationError" },
            () => "Invalid or missing fields",
        )
        .with(
            { _errorKind: "DuplicateNameError" },
            () => "Project name is already taken",
        )
        .with(
            { _errorKind: "DoesNotExistError" },
            () => "Project template does not exist",
        )
        .with(
            { _errorKind: "InternalError" },
            () => "An internal error occurred",
        )
        .exhaustive();
}

export function CreateProjectForm({
    projectTemplateId,
    onSuccess,
}: {
    projectTemplateId: string;
    onSuccess: () => void;
}): React.ReactNode {
    const form = useForm({
        mode: "uncontrolled",
        initialValues: {
            name: "",
            description: "",
            startsAt: new Date(),
        },
        validate: zodResolver(
            payloadSchema
                .omit({ projectTemplateId: true })
                .setKey("startsAt", z.date()),
        ),
    });
    type FormValues = typeof form.values;

    const queryClient = useQueryClient();
    const createProjectMutation = useMutation({
        mutationFn: async (values: FormValues) => {
            const { startsAt, ...rest } = values;
            const result = await createProjectAction({
                ...rest,
                startsAt: startsAt.toISOString().split("T")[0], // Extract YYYY-MM-DD.
                projectTemplateId,
            });
            return pipe(
                result,
                E.getOrElseW((err) => {
                    throw err;
                }),
            );
        },
        onSuccess: () => {
            // Re-fetch the project template data so that the projects table is updated.
            queryClient.invalidateQueries({
                queryKey: ["retrieve-project-template-data"],
            });

            notifySuccess({
                message: "Successfully created project.",
            });
            // Call `onSuccess` whenever creation is successful.
            onSuccess();
        },
        onError: (_err: Failure) =>
            notifyError({
                message: "Failed to create project.",
            }),
    });

    return (
        <form
            onSubmit={form.onSubmit((values) =>
                createProjectMutation.mutate(values),
            )}
        >
            <TextInput
                label="Name"
                required
                description="Name of the project template"
                error="Invalid project template name"
                placeholder="Project template name"
                disabled={createProjectMutation.isPending}
                {...form.getInputProps("name")}
            />
            <Textarea
                label="Description"
                required
                description="Enter description"
                error="Invalid description"
                placeholder="Add description"
                disabled={createProjectMutation.isPending}
                {...form.getInputProps("description")}
            />
            <DatePickerInput
                label="Start Date"
                required
                description="The project's start date"
                error="Invalid project start date"
                placeholder="Project start date"
                disabled={createProjectMutation.isPending}
                {...form.getInputProps("startsAt")}
            />
            <div className="relative mb-4">
                <ul className="text-red-500">
                    {createProjectMutation.error &&
                        getCreateErrorMessage(createProjectMutation.error)}
                </ul>
            </div>
            <Group justify="flex-end">
                <Button type="submit" loading={createProjectMutation.isPending}>
                    Create
                </Button>
            </Group>
        </form>
    );
}
