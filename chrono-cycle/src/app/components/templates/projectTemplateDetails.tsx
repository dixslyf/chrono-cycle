"use client";

import {
    Badge,
    Button,
    Group,
    Skeleton,
    Stack,
    Text,
    Textarea,
    useModalsStack,
} from "@mantine/core";
import { useForm, zodResolver, type UseFormReturnType } from "@mantine/form";
import {
    useMutation,
    UseMutationResult,
    useQueryClient,
} from "@tanstack/react-query";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import { useEffect } from "react";

import { EditableTitle } from "@/app/components/customComponent/editableTitle";
import { SplitModal } from "@/app/components/customComponent/splitModal";
import brownSkeletonClasses from "@/app/skeleton-brown-bg.module.css";
import { notifyError, notifySuccess } from "@/app/utils/notifications";
import { queryKeys } from "@/app/utils/queries/keys";

import { ProjectTemplate, ProjectTemplateOverview } from "@/common/data/domain";
import { formatDate } from "@/common/dates";

import { updateProjectTemplateAction } from "@/features/project-templates/update/action";
import {
    Failure,
    Payload,
    payloadSchema,
} from "@/features/project-templates/update/data";

import { DeleteProjectTemplateButton } from "./deleteProjectTemplateButton";
import { EventTemplatesTable } from "./eventTemplatesTable";
import { ExportProjectTemplateButton } from "./exportProjectTemplateButton";

type FormValues = {
    name: string;
    description: string;
};

export function ProjectTemplateDetailsLeft<T extends string>({
    projectTemplate,
    modalStack,
    form,
    mutation,
    isLoading,
}: {
    projectTemplate?: ProjectTemplate | undefined;
    modalStack: ReturnType<
        typeof useModalsStack<
            | "project-template-details"
            | "add-event"
            | "event-template-details"
            | "confirm-delete-event-template"
            | T
        >
    >;
    form: UseFormReturnType<FormValues>;
    mutation: UseMutationResult<
        ProjectTemplateOverview,
        Failure,
        FormValues,
        unknown
    >;
    isLoading?: boolean | undefined;
}): React.ReactNode {
    return (
        // This part will eventually change to form. Data will be the value for inputs
        <Stack className="h-full overflow-y-auto" align="stretch" gap="xl">
            <Skeleton visible={isLoading}>
                <Stack className="h-1/4" align="stretch">
                    <Textarea
                        key={form.key("description")}
                        label="Description"
                        classNames={{
                            label: "text-palette5 font-semibold text-xl mb-2",
                            input: "text-base border border-gray-400 rounded-xl",
                        }}
                        disabled={isLoading || mutation.isPending}
                        {...form.getInputProps("description")}
                    />
                </Stack>
            </Skeleton>
            <Skeleton visible={isLoading}>
                <Stack className="flex-1">
                    <Text className="text-palette5 font-semibold text-xl">
                        Events
                    </Text>
                    <EventTemplatesTable
                        projectTemplateId={projectTemplate?.id ?? ""}
                        eventTemplates={projectTemplate?.events ?? []}
                        modalStack={modalStack}
                    />
                </Stack>
            </Skeleton>
        </Stack>
    );
}

export function ProjectTemplateDetailsRight<T extends string>({
    projectTemplate,
    modalStack,
    onDeleteSuccess,
    form,
    mutation,
    isLoading,
}: {
    projectTemplate?: ProjectTemplate | undefined;
    modalStack: ReturnType<
        typeof useModalsStack<"confirm-delete-project-template" | T>
    >;
    onDeleteSuccess: () => void;
    form: UseFormReturnType<FormValues>;
    mutation: UseMutationResult<
        ProjectTemplateOverview,
        Failure,
        FormValues,
        unknown
    >;
    isLoading?: boolean | undefined;
}): React.ReactNode {
    return (
        <Stack h="100%" justify="space-between">
            <Stack>
                <Skeleton
                    visible={isLoading}
                    className={brownSkeletonClasses.root}
                >
                    <Group>
                        <Text className="font-semibold text-xl text-palette3">
                            Project Template ID:
                        </Text>
                        <Badge size="lg" color="brown">
                            {projectTemplate?.id}
                        </Badge>
                    </Group>
                </Skeleton>
                <Skeleton
                    visible={isLoading}
                    className={brownSkeletonClasses.root}
                >
                    <Group gap="md">
                        <Text className="text-palette3 font-semibold text-xl">
                            Created At:
                        </Text>
                        <Text className="text-lg font-medium text-gray-300">
                            {projectTemplate &&
                                formatDate(projectTemplate.createdAt, {
                                    withTime: true,
                                })}
                        </Text>
                    </Group>
                </Skeleton>
                <Skeleton
                    visible={isLoading}
                    className={brownSkeletonClasses.root}
                >
                    <Group>
                        <Text className="text-palette3 font-semibold text-xl">
                            Updated At:
                        </Text>
                        <Text className="text-lg font-medium text-gray-300">
                            {projectTemplate &&
                                formatDate(projectTemplate.updatedAt, {
                                    withTime: true,
                                })}
                        </Text>
                    </Group>
                </Skeleton>
            </Stack>
            <Group justify="flex-end">
                <DeleteProjectTemplateButton
                    projectTemplateId={projectTemplate?.id ?? ""}
                    modalStack={modalStack}
                    onSuccess={onDeleteSuccess}
                    disabled={isLoading}
                />
                <ExportProjectTemplateButton
                    projectTemplate={projectTemplate}
                    disabled={isLoading}
                />
                <Button
                    type="submit"
                    form="update-project-template-form"
                    loading={mutation.isPending}
                    disabled={isLoading || !form.isDirty()}
                >
                    Save
                </Button>
            </Group>
        </Stack>
    );
}

export function ProjectTemplateDetailsModal<T extends string>({
    modalStack,
    projectTemplate,
    isLoading,
}: {
    modalStack: ReturnType<
        typeof useModalsStack<
            | "project-template-details"
            | "add-event"
            | "event-template-details"
            | "confirm-delete-event-template"
            | "confirm-delete-project-template"
            | T
        >
    >;
    projectTemplate?: ProjectTemplate;
    isLoading?: boolean;
}) {
    const form = useForm({
        mode: "uncontrolled",
        initialValues: {
            name: projectTemplate?.name ?? "",
            description: projectTemplate?.description ?? "",
        },
        validate: zodResolver(payloadSchema.omit({ id: true })),
    });

    // Needed for the initial values to show properly. The reason is that,
    // by the time the project template data has been loaded, the form has already
    // been created (with empty strings since those are the fallback). We need to manually
    // reset the form once the project template data has loaded to set the initial values.
    const setFormInitialValues = form.setInitialValues;
    const resetForm = form.reset;
    useEffect(() => {
        if (projectTemplate) {
            setFormInitialValues({
                name: projectTemplate.name,
                description: projectTemplate.description,
            });
            resetForm();
        }
    }, [projectTemplate, setFormInitialValues, resetForm]);

    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async (values: FormValues) => {
            const payload = {
                id: projectTemplate?.id as string,
                ...values,
            } as Payload;

            // Set name to undefined if it hasn't changed to prevent
            // server action from raising duplicate name error.
            if (values.name === projectTemplate?.name) {
                payload.name = undefined;
            }

            const result = await updateProjectTemplateAction(null, payload);

            return pipe(
                result,
                E.getOrElseW((err) => {
                    throw err;
                }),
            );
        },
        onSuccess: () => {
            notifySuccess({
                message: "Successfully updated project template!",
            });
            queryClient.invalidateQueries({
                queryKey: queryKeys.projectTemplates.list(),
            });

            // Safety: Project template should already have loaded,
            // so its ID can be safely cast to string.
            queryClient.invalidateQueries({
                queryKey: queryKeys.projectTemplates.retrieve(
                    projectTemplate?.id as string,
                ),
            });
        },
        onError: (_err: Failure) => {
            notifyError({ message: "Failed to update project template." });
        },
    });

    return (
        <SplitModal {...modalStack.register("project-template-details")}>
            <form
                id="update-project-template-form"
                onSubmit={form.onSubmit((values) => mutation.mutate(values))}
            />
            <SplitModal.Left
                title={projectTemplate?.name}
                titleComponent={() => (
                    <EditableTitle
                        key={form.key("name")}
                        disabled={isLoading || mutation.isPending}
                        {...form.getInputProps("name")}
                    />
                )}
            >
                <ProjectTemplateDetailsLeft
                    modalStack={modalStack}
                    projectTemplate={projectTemplate}
                    form={form}
                    mutation={mutation}
                    isLoading={isLoading}
                />
            </SplitModal.Left>
            <SplitModal.Right title="Metadata">
                <ProjectTemplateDetailsRight
                    projectTemplate={projectTemplate}
                    modalStack={modalStack}
                    onDeleteSuccess={() =>
                        modalStack.close("project-template-details")
                    }
                    form={form}
                    mutation={mutation}
                    isLoading={isLoading}
                />
            </SplitModal.Right>
        </SplitModal>
    );
}
