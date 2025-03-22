"use client";

import { Button, Group, Textarea, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import { zodResolver } from "mantine-form-zod-resolver";
import { match, P } from "ts-pattern";

import { notifyError, notifySuccess } from "@/app/utils/notifications";

import { ValidationIssues } from "@/common/errors";

import { createProjectTemplateAction } from "@/features/project-templates/create/action";
import {
    Failure,
    payloadSchema,
} from "@/features/project-templates/create/data";

function getCreateErrorMessage(failure: Failure) {
    return match(failure)
        .with(
            { _errorKind: "ValidationError" },
            () => "Invalid or missing fields",
        )
        .with(
            { _errorKind: "DuplicateNameError" },
            () => "Project template name is already taken",
        )
        .with(
            { _errorKind: "InternalError" },
            () => "An internal error occurred",
        )
        .exhaustive();
}

function extractValidationIssues(
    failure: Failure,
): ValidationIssues<"name" | "description"> {
    return match(failure)
        .with(
            { _errorKind: "ValidationError", issues: P.select() },
            (issues) => issues,
        )
        .otherwise(() => ({ name: [], description: [] }));
}

export function CreateProjectTemplateForm({
    onSuccess,
}: {
    onSuccess: () => void;
}): React.ReactNode {
    const form = useForm({
        mode: "uncontrolled",
        initialValues: {
            name: "",
            description: "",
        },
        validate: zodResolver(payloadSchema),
    });

    // Action state for creating a project template.
    const queryClient = useQueryClient();
    const createMutation = useMutation({
        mutationFn: async (values: typeof form.values) => {
            const result = await createProjectTemplateAction(values);
            return pipe(
                result,
                E.match(
                    (err) => {
                        throw err;
                    },
                    (ptOverview) => ptOverview,
                ),
            );
        },
        onSuccess: () => {
            notifySuccess({
                message: "Successfully created project template.",
            });
            queryClient.invalidateQueries({
                queryKey: ["list-project-templates"],
            });
            onSuccess();
        },
        onError: (_err: Failure) => {
            notifyError({
                message: "Failed to create project template.",
            });
        },
    });

    return (
        <form
            onSubmit={form.onSubmit((values) => createMutation.mutate(values))}
        >
            <TextInput
                name="name"
                label="Name"
                required
                description="Name of the project template"
                error="Invalid project template name"
                placeholder="Project template name"
                disabled={createMutation.isPending}
                {...form.getInputProps("name")}
            />
            <Textarea
                name="description"
                label="Description"
                required
                description="Enter description"
                error="Invalid description"
                placeholder="Add description"
                disabled={createMutation.isPending}
                {...form.getInputProps("description")}
            />
            <div className="relative mb-4">
                <ul className="text-red-500">
                    {createMutation.isError &&
                        getCreateErrorMessage(createMutation.error)}
                    {createMutation.isError &&
                        Object.entries(
                            extractValidationIssues(createMutation.error),
                        ).flatMap(([fieldName, errors]) =>
                            errors.map((err, idx) => (
                                <li
                                    key={`${fieldName}-${idx}`}
                                    className="px-4 py-3"
                                >
                                    {err || ""}
                                </li>
                            )),
                        )}
                </ul>
            </div>
            <Group justify="flex-end">
                <Button type="submit" loading={createMutation.isPending}>
                    Create
                </Button>
            </Group>
        </form>
    );
}
