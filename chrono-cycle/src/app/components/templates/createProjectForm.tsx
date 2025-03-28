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
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import { zodResolver } from "mantine-form-zod-resolver";
import { match } from "ts-pattern";
import { z } from "zod";

import { notifyError, notifySuccess } from "@/app/utils/notifications";
import { queryKeys } from "@/app/utils/queries/keys";

import { ProjectTemplateOverview } from "@/common/data/domain";

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
            { _errorKind: "MalformedTimeStringError" },
            () => "One or more reminder templates have a malformed time.",
        )
        .with(
            { _errorKind: "NoEventTemplatesError" },
            () =>
                "The selected project template does not have any events. Please add some events and try again.",
        )
        .with(
            { _errorKind: "InternalError" },
            () => "An internal error occurred",
        )
        .exhaustive();
}

export function CreateProjectFormSkeleton() {
    return (
        <Stack>
            <Skeleton height={48} />
            <Skeleton height={48} />
            <Skeleton height={96} />
            <Skeleton height={48} />
            <Group justify="flex-end">
                <Button disabled>Create</Button>
            </Group>
        </Stack>
    );
}

export function CreateProjectForm({
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
            startsAt: new Date(),
        },
        validate: zodResolver(
            payloadSchema
                .setKey(
                    "projectTemplateId",
                    z.string().nonempty("Please select a template."),
                )
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
                projectTemplateId: values.projectTemplateId,
            });
            return pipe(
                result,
                E.getOrElseW((err) => {
                    throw err;
                }),
            );
        },
        onSuccess: () => {
            // Also re-fetch the projects data for the dashboard.
            queryClient.invalidateQueries({
                queryKey: queryKeys.projects.listAll(),
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

    if (isPendingProjectTemplates || !projectTemplates) {
        return <CreateProjectFormSkeleton />;
    }

    return (
        <form
            onSubmit={form.onSubmit((values) =>
                createProjectMutation.mutate(values),
            )}
        >
            <Select
                label="Template"
                required
                description="The project template to use"
                error="Invalid project template"
                placeholder="Project template"
                searchable
                disabled={createProjectMutation.isPending}
                data={projectTemplates?.map((pts) => ({
                    label: `${pts.name} (${pts.id})`,
                    value: pts.id,
                }))}
                {...form.getInputProps("projectTemplateId")}
            />
            <TextInput
                label="Name"
                required
                description="Name of the project"
                error="Invalid project name"
                placeholder="Project name"
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
