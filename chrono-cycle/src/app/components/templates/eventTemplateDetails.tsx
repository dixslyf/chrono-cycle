"use client";

import {
    Badge,
    Box,
    Button,
    Checkbox,
    Fieldset,
    Group,
    NumberInput,
    Select,
    SimpleGrid,
    Stack,
    TagsInput,
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
import { pipe } from "fp-ts/function";
import { Calendar, Clock } from "lucide-react";
import { useEffect } from "react";

import { EditableTitle } from "@/app/components/customComponent/editableTitle";
import { SplitModal } from "@/app/components/customComponent/splitModal";
import { formatReminderTemplateTime } from "@/app/utils/dates";
import { notifyError, notifySuccess } from "@/app/utils/notifications";
import { queryKeys } from "@/app/utils/queries/keys";

import { EventTemplate, ReminderTemplate, Tag } from "@/common/data/domain";

import { updateEventTemplateAction } from "@/features/event-templates/update/action";
import {
    Failure,
    Payload,
    payloadSchema,
} from "@/features/event-templates/update/data";

import { DeleteEventTemplateButton } from "./deleteEventTemplateButton";

// Removing auto-scheduling because we don't have time to implement it.
type UpdateFormValues = Required<Omit<Payload, "id" | "autoReschedule">>;

interface EventTemplateDetailsLeftProps {
    eventTemplate: EventTemplate;
    updateMutation: UseMutationResult<EventTemplate, Failure, UpdateFormValues>;
    updateForm: UseFormReturnType<UpdateFormValues>;
}

export function EventTemplateDetailsLeft({
    eventTemplate,
    updateMutation,
    updateForm,
}: EventTemplateDetailsLeftProps) {
    return (
        <Stack gap="xl" className="h-full">
            {/* Not editable because an event's type is not modifiable. */}
            <Text>
                <Text span fw={500}>
                    Event type:
                </Text>
                {eventTemplate.eventType === "task" ? " Task" : " Activity"}
            </Text>
            <Group grow>
                {/* offset days */}
                <NumberInput
                    size="md"
                    label="Offset days"
                    error="Invalid number of offset days"
                    disabled={updateMutation.isPending}
                    required
                    {...updateForm.getInputProps("offsetDays")}
                />
                {/* duration */}
                <NumberInput
                    size="md"
                    key={updateForm.key("duration")}
                    label="Duration (days)"
                    min={1}
                    error="Invalid duration"
                    disabled={
                        updateMutation.isPending ||
                        eventTemplate.eventType === "task"
                    }
                    required
                    {...updateForm.getInputProps("duration")}
                />
            </Group>
            {/* note */}
            <Textarea
                label="Note"
                size="md"
                placeholder="Enter note"
                disabled={updateMutation.isPending}
                error="Invalid note"
                minRows={3}
                maxRows={3}
                {...updateForm.getInputProps("note")}
            />
            <TagsInput
                size="md"
                label="Tags"
                placeholder="Add a Tag"
                disabled={updateMutation.isPending}
                {...updateForm.getInputProps("tags")}
                classNames={{ pill: "bg-gray-200" }}
            />
        </Stack>
    );
}

interface EventTemplateDetailsRightProps<T extends string> {
    eventTemplate: EventTemplate;
    modalStack: ReturnType<
        typeof useModalsStack<"confirm-delete-event-template" | T>
    >;
    updateMutation: UseMutationResult<EventTemplate, Failure, UpdateFormValues>;
    updateForm: UseFormReturnType<UpdateFormValues>;
    onClose: () => void;
}

export function EventTemplateDetailsRight<T extends string>({
    eventTemplate,
    modalStack,
    updateMutation,
    updateForm,
    onClose,
}: EventTemplateDetailsRightProps<T>) {
    return (
        <Stack className="h-full" justify="space-between">
            <Stack>
                <Group justify="space-between" className="pb-4">
                    <Group>
                        <Text className="font-semibold text-xl text-palette3">
                            Event ID
                        </Text>
                        <Badge className="bg-stone-500 bg-opacity-50 text-gray-300">
                            {eventTemplate.id}
                        </Badge>
                    </Group>
                </Group>
                <SimpleGrid cols={2}>
                    <Group justify="space-between" className="py-4">
                        <Text className="text-md font-semibold text-palette3">
                            Offset Days
                        </Text>
                        <Text className="text-md font-semibold text-red-500">
                            {eventTemplate.offsetDays}
                        </Text>
                    </Group>
                    <Group justify="space-between" className="py-4">
                        <Text className="text-md font-semibold text-palette3">
                            Automatic Reschedule
                        </Text>
                        <Checkbox
                            checked={eventTemplate.autoReschedule}
                            readOnly
                        />
                    </Group>
                    <Group justify="space-between" className="py-4">
                        <Text className="text-md font-semibold text-palette3">
                            Event Type
                        </Text>
                        <Text
                            className={`text-md font-semibold ${
                                eventTemplate.eventType === "task"
                                    ? "text-fuchsia-500"
                                    : "text-blue-400"
                            }`}
                        >
                            {eventTemplate.eventType === "task"
                                ? "Task"
                                : "Activity"}
                        </Text>
                    </Group>
                    <Group justify="space-between" className="py-4">
                        <Text className="text-md font-semibold text-palette3">
                            Duration (days)
                        </Text>
                        <Text className="text-md font-semibold text-green-400">
                            {eventTemplate.eventType === "activity"
                                ? eventTemplate.duration !== null
                                    ? eventTemplate.duration
                                    : "-"
                                : "-"}
                        </Text>
                    </Group>
                </SimpleGrid>
                <Stack gap="sm" className="py-4">
                    <Text className="text-md font-semibold text-palette3">
                        Tags
                    </Text>
                    <Group>
                        {eventTemplate.tags.length > 0 ? (
                            <Group>
                                {eventTemplate.tags.map((tag: Tag) => (
                                    <Badge
                                        key={tag.id}
                                        className="bg-stone-500 bg-opacity-50 text-gray-300"
                                    >
                                        {tag.name}
                                    </Badge>
                                ))}
                            </Group>
                        ) : (
                            <Text className="text-gray-300">
                                No tags assigned
                            </Text>
                        )}
                    </Group>
                </Stack>
            </Stack>
            <Group justify="flex-end">
                <DeleteEventTemplateButton
                    eventTemplateId={eventTemplate.id}
                    modalStack={modalStack}
                    onSuccess={onClose}
                />
                <Button
                    type="submit"
                    form="update-event-template-form"
                    loading={updateMutation.isPending}
                    disabled={!updateForm.isDirty()}
                >
                    Save
                </Button>
            </Group>
        </Stack>
    );
}

export function EventTemplateDetailsModal<T extends string>({
    modalStack,
    eventTemplate,
}: {
    modalStack: ReturnType<
        typeof useModalsStack<
            "event-details" | "confirm-delete-event-template" | T
        >
    >;
    eventTemplate?: EventTemplate;
}) {
    const updateForm = useForm({
        mode: "uncontrolled",
        initialValues: {
            name: eventTemplate?.name ?? "",
            offsetDays: eventTemplate?.offsetDays ?? 0,
            duration: eventTemplate?.duration ?? 0,
            note: eventTemplate?.note ?? "",
            remindersDelete: [] as NonNullable<Payload["remindersDelete"]>,
            remindersUpdate: [] as NonNullable<Payload["remindersUpdate"]>,
            remindersInsert: [] as NonNullable<Payload["remindersInsert"]>,
            tags:
                eventTemplate?.tags.map((tag) => tag.name) ?? ([] as string[]),
        } satisfies UpdateFormValues,
        validate: zodResolver(payloadSchema.omit({ id: true })),
    });

    // Similar to project template details. Needed for the initial values to show properly.
    // By the time the project template data has been loaded, the form has already
    // been created (with empty strings since those are the fallback). We need to manually
    // reset the form once the event template data has loaded to set the initial values.
    const setFormInitialValues = updateForm.setInitialValues;
    const resetForm = updateForm.reset;
    useEffect(() => {
        if (eventTemplate) {
            setFormInitialValues({
                name: eventTemplate.name,
                offsetDays: eventTemplate.offsetDays,
                duration: eventTemplate.duration,
                note: eventTemplate.note,
                remindersDelete: [] as NonNullable<Payload["remindersDelete"]>,
                remindersUpdate: [] as NonNullable<Payload["remindersUpdate"]>,
                remindersInsert: [] as NonNullable<Payload["remindersInsert"]>,
                tags: eventTemplate.tags.map((tag) => tag.name),
            });
            resetForm();
        }
    }, [eventTemplate, setFormInitialValues, resetForm]);

    useEffect(() => {
        console.log(updateForm.values);
    }, [updateForm.values]);

    const queryClient = useQueryClient();
    const updateMutation = useMutation({
        mutationFn: async (values: UpdateFormValues) => {
            const result = await updateEventTemplateAction(null, {
                id: eventTemplate?.id as string,
                ...values,
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
                message: "Successfully updated event template!",
            });

            // Safety: Project template should already have loaded,
            // so its ID can be safely cast to string.
            queryClient.invalidateQueries({
                queryKey: queryKeys.projectTemplates.retrieve(
                    eventTemplate?.projectTemplateId as string,
                ),
            });
        },
        onError: (_err: Failure) => {
            notifyError({ message: "Failed to update event template." });
        },
    });

    return (
        <SplitModal {...modalStack.register("event-details")}>
            <form
                id="update-event-template-form"
                onSubmit={updateForm.onSubmit((values) =>
                    updateMutation.mutate(values),
                )}
            />
            {eventTemplate ? (
                <>
                    <SplitModal.Left
                        title={eventTemplate?.name ?? ""}
                        titleComponent={() => (
                            <EditableTitle
                                key={updateForm.key("name")}
                                disabled={updateMutation.isPending}
                                {...updateForm.getInputProps("name")}
                            />
                        )}
                    >
                        <EventTemplateDetailsLeft
                            eventTemplate={eventTemplate}
                            updateForm={updateForm}
                            updateMutation={updateMutation}
                        />
                    </SplitModal.Left>
                    <SplitModal.Right>
                        <EventTemplateDetailsRight
                            eventTemplate={eventTemplate}
                            modalStack={modalStack}
                            updateMutation={updateMutation}
                            updateForm={updateForm}
                            onClose={() => modalStack.close("event-details")}
                        />
                    </SplitModal.Right>
                </>
            ) : (
                <Box>Loading event details...</Box>
            )}
        </SplitModal>
    );
}
