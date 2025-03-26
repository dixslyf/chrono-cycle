"use client";

import {
    Box,
    Button,
    Group,
    List,
    Stack,
    Text,
    Textarea,
    TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import { X } from "lucide-react";
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
    onClose,
}: {
    onSuccess: () => void;
    onClose: () => void;
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
        <Stack className="p-6" justify="center">
            <Stack>
                <Text className="text-3xl font-bold">
                    Create Project Template
                </Text>
                <form
                    onSubmit={form.onSubmit((values) =>
                        createMutation.mutate(values),
                    )}
                >
                    <Stack gap="xl" mt="md">
                        <TextInput
                            size="md"
                            name="name"
                            label="Template Name"
                            required
                            description="Name of the project template"
                            placeholder="Project template name"
                            disabled={createMutation.isPending}
                            {...form.getInputProps("name")}
                        />
                        <Textarea
                            size="md"
                            name="description"
                            label="Description"
                            required
                            description="Enter description"
                            error="Invalide description"
                            placeholder="Add description"
                            disabled={createMutation.isPending}
                            {...form.getInputProps("description")}
                        />
                        {createMutation.isError && (
                            <Box className="relative mb-4">
                                <List
                                    spacing="xs"
                                    size="sm"
                                    className="text-red-500"
                                >
                                    <List.Item>
                                        {getCreateErrorMessage(
                                            createMutation.error,
                                        )}
                                    </List.Item>
                                    {Object.entries(
                                        extractValidationIssues(
                                            createMutation.error,
                                        ),
                                    ).flatMap(([fieldName, errors]) =>
                                        errors.map((err, idx) => (
                                            <List.Item
                                                key={`${fieldName}-${idx}`}
                                                className="px-4 py-3"
                                            >
                                                {err || ""}
                                            </List.Item>
                                        )),
                                    )}
                                </List>
                            </Box>
                        )}
                        <Group justify="flex-end">
                            <Button
                                type="submit"
                                loading={createMutation.isPending}
                            >
                                Create Template
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Stack>
        </Stack>
    );
}
