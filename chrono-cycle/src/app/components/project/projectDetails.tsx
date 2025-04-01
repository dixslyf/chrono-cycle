"use client";

import {
    Badge,
    Button,
    Group,
    Skeleton,
    Stack,
    Text,
    useModalsStack,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import * as O from "fp-ts/Option";
import { DateTime } from "luxon";
import React, { useEffect } from "react";
import { match } from "ts-pattern";

import { EditableTitle } from "@/app/components/customComponent/editableTitle";
import { SplitModal } from "@/app/components/customComponent/splitModal";
import { formatDate } from "@/app/utils/dates";
import { notifyError, notifySuccess } from "@/app/utils/notifications";
import { queryKeys } from "@/app/utils/queries/keys";

import { Project, ProjectTemplate } from "@/common/data/domain";

import { updateProjectAction } from "@/features/projects/update/action";
import { Failure, Payload } from "@/features/projects/update/data";

import { DeleteProjectButton } from "./deleteProjectButton";

function extractUpdateErrorMessage(err: Failure): string {
    return match(err)
        .with(
            { _errorKind: "DuplicateNameError" },
            () => "Project name is already taken!",
        )
        .with(
            { _errorKind: "DoesNotExistError" },
            () => "Project does not exist!",
        )
        .with(
            { _errorKind: "ValidationError" },
            () => "One or more fields are invalid!",
        )
        .with(
            { _errorKind: "InternalError" },
            () => "Failed to create project!",
        )
        .exhaustive();
}

function ProjectDetailsLeft({
    project,
    projectTemplate,
    isLoading,
}: {
    project?: Project;
    projectTemplate?: O.Option<ProjectTemplate>;
    isLoading?: boolean;
}): React.ReactNode {
    return (
        <Stack className="h-full overflow-y-auto" align="stretch" gap="xl">
            {/* description */}
            <Skeleton visible={isLoading}>
                <Stack align="stretch">
                    <Text className="text-palette5 font-semibold text-xl">
                        Description
                    </Text>
                    <Text className="flex-1 border border-gray-400 rounded-xl p-4">
                        {project?.description}
                    </Text>
                </Stack>
            </Skeleton>
            <Skeleton visible={isLoading}>
                <Stack>
                    <Text>Project Template:</Text>
                    <Text>
                        {pipe(
                            projectTemplate,
                            O.fromNullable,
                            O.flatten,
                            O.map((pt) => `${pt.name} (${pt.id})`),
                            O.getOrElse(() => "None"),
                        )}
                    </Text>
                </Stack>
            </Skeleton>
        </Stack>
    );
}

function ProjectDetailsRight<T extends string>({
    modalStack,
    project,
    isLoading,
    saveLoading,
    saveDisabled,
}: {
    modalStack: ReturnType<
        typeof useModalsStack<"confirm-delete-project" | "project-details" | T>
    >;
    project?: Project;
    isLoading?: boolean;
    saveLoading?: boolean;
    saveDisabled?: boolean;
}): React.ReactNode {
    return (
        <Stack h="100%" justify="space-between">
            <Stack>
                <Skeleton visible={isLoading}>
                    <Group>
                        <Text className="font-semibold text-xl text-palette3">
                            Project ID:
                        </Text>
                        <Badge size="lg" color="brown">
                            {project?.id}
                        </Badge>
                    </Group>
                </Skeleton>
                <Skeleton visible={isLoading}>
                    <Group>
                        <Text className="text-palette3 font-semibold text-xl">
                            Starts At:
                        </Text>
                        <Text className="text-lg font-medium text-gray-300">
                            {project ? formatDate(project.startsAt) : undefined}
                        </Text>
                    </Group>
                </Skeleton>
                <Skeleton visible={isLoading}>
                    <Group>
                        <Text className="text-palette3 font-semibold text-xl">
                            Created At:
                        </Text>
                        <Text className="text-lg font-medium text-gray-300">
                            {project
                                ? formatDate(project.createdAt, {
                                      withTime: true,
                                  })
                                : undefined}
                        </Text>
                    </Group>
                </Skeleton>
                <Skeleton visible={isLoading}>
                    <Group>
                        <Text className="text-palette3 font-semibold text-xl">
                            Updated At:
                        </Text>
                        <Text className="text-lg font-medium text-gray-300">
                            {project
                                ? formatDate(project.updatedAt, {
                                      withTime: true,
                                  })
                                : undefined}
                        </Text>
                    </Group>
                </Skeleton>
            </Stack>
            <Group justify="flex-end">
                <DeleteProjectButton
                    projectId={project?.id}
                    modalStack={modalStack}
                    onSuccess={() => modalStack.close("project-details")}
                    disabled={isLoading}
                />
                <Button
                    type="submit"
                    form="update-project-form"
                    loading={saveLoading}
                    disabled={isLoading || saveDisabled}
                >
                    Save
                </Button>
            </Group>
        </Stack>
    );
}

export function ProjectDetailsModal<T extends string>({
    modalStack,
    project,
    projectTemplate,
    isLoading,
}: {
    modalStack: ReturnType<
        typeof useModalsStack<"project-details" | "confirm-delete-project" | T>
    >;
    project?: Project;
    projectTemplate?: O.Option<ProjectTemplate>;
    isLoading?: boolean;
}) {
    const updateForm = useForm({
        mode: "uncontrolled",
        initialValues: {
            name: project?.name ?? "",
            description: project?.description ?? "",
            startsAt: project?.startsAt ?? new Date(),
        },
        // validate: zodResolver(payloadSchema.omit({ id: true })),
    });
    type FormValues = typeof updateForm.values;

    // Needed for the initial values to show properly. The reason is that,
    // by the time the project data has been loaded, the form has already
    // been created (with empty strings since those are the fallback). We need to manually
    // reset the form once the project data has loaded to set the initial values.
    const setFormInitialValues = updateForm.setInitialValues;
    const resetForm = updateForm.reset;
    useEffect(() => {
        if (project) {
            setFormInitialValues({
                name: project.name,
                description: project.description,
                startsAt: project.startsAt,
            });
            resetForm();
        }
    }, [project, setFormInitialValues, resetForm]);

    const queryClient = useQueryClient();
    const updateMutation = useMutation({
        mutationFn: async (values: FormValues) => {
            const { startsAt: startsAtDate, ...rest } = values;
            // By default, Luxon already uses the local timezone, so the date should be correct.
            // Safety: JS dates will always successfully into a DateTime, so we should never
            // encounter a null.
            const startsAt = DateTime.fromJSDate(
                startsAtDate,
            ).toISODate() as string;

            const payload = {
                id: project?.id as string,
                startsAt,
                ...rest,
            } as Payload;

            // Set name to undefined if it hasn't changed to prevent
            // server action from raising duplicate name error.
            if (values.name === project?.name) {
                payload.name = undefined;
            }

            const result = await updateProjectAction(null, payload);

            return pipe(
                result,
                E.getOrElseW((err) => {
                    throw err;
                }),
            );
        },
        onSuccess: () => {
            notifySuccess({
                message: "Successfully updated project!",
            });

            queryClient.invalidateQueries({
                queryKey: queryKeys.projects.listAll(),
            });

            // Safety: Project should not be undefined if we've reached here.
            queryClient.invalidateQueries({
                queryKey: queryKeys.projects.retrieveProjectTemplate(
                    project?.id as string,
                ),
            });
        },
        onError: (err: Failure) => {
            notifyError({ message: extractUpdateErrorMessage(err) });
        },
    });
    return (
        <SplitModal {...modalStack.register("project-details")}>
            <form
                id="update-project-form"
                onSubmit={updateForm.onSubmit((values) =>
                    updateMutation.mutate(values),
                )}
            />
            {/* TODO: skeleton for name */}
            <SplitModal.Left
                title={`${project?.name}`}
                titleComponent={() => (
                    <EditableTitle
                        key={updateForm.key("name")}
                        disabled={updateMutation.isPending}
                        {...updateForm.getInputProps("name")}
                    />
                )}
            >
                <ProjectDetailsLeft
                    project={project}
                    projectTemplate={projectTemplate}
                    isLoading={isLoading}
                />
            </SplitModal.Left>
            <SplitModal.Right title="Metadata">
                <ProjectDetailsRight
                    project={project}
                    modalStack={modalStack}
                    isLoading={isLoading}
                    saveLoading={updateMutation.isPending}
                    saveDisabled={!updateForm.isDirty()}
                />
            </SplitModal.Right>
        </SplitModal>
    );
}
