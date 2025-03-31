"use client";

import {
    Badge,
    Box,
    Button,
    Checkbox,
    Fieldset,
    Group,
    SimpleGrid,
    Stack,
    Text,
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
    onClose: () => void;
}

export function EventTemplateDetailsLeft({
    eventTemplate,
}: EventTemplateDetailsLeftProps) {
    return (
        <Stack className="w-full h-full">
            {/* notes */}
            <Stack>
                <Fieldset legend="Note" className="border-gray-400 rounded-xl">
                    <Text className="text-gray-600">
                        {eventTemplate.note || "No note attached"}
                    </Text>
                </Fieldset>
            </Stack>
            <Fieldset
                legend="Reminders"
                className="border-gray-400 rounded-xl flex-1"
            >
                <SimpleGrid cols={2} className="w-full">
                    {eventTemplate.reminders.length > 0 ? (
                        eventTemplate.reminders.map(
                            (reminder: ReminderTemplate, _index) => (
                                <Stack
                                    key={reminder.id}
                                    className="border border-gray-400 rounded-lg p-4"
                                    justify="center"
                                >
                                    <Group gap="xl">
                                        <Group gap="md">
                                            <Calendar className="w-8 h-8" />
                                            <Text>Days before event:</Text>
                                        </Group>
                                        <Text>
                                            {reminder.daysBeforeEvent}{" "}
                                            {reminder.daysBeforeEvent === 1
                                                ? "day"
                                                : "days"}
                                        </Text>
                                    </Group>
                                    <Group gap="xl">
                                        <Group gap="md">
                                            <Clock className="w-8 h-8" />
                                            <Text>Trigger time:</Text>
                                        </Group>
                                        <Text>
                                            {formatReminderTemplateTime(
                                                reminder.time,
                                            )}
                                        </Text>
                                    </Group>
                                    <Group>
                                        <Checkbox
                                            checked={
                                                reminder.emailNotifications
                                            }
                                            readOnly
                                            label="Email notification"
                                        />
                                    </Group>
                                </Stack>
                            ),
                        )
                    ) : (
                        <Text className="text-gray-600">No reminders set</Text>
                    )}
                </SimpleGrid>
            </Fieldset>
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
                                {...updateForm.getInputProps("name")}
                            />
                        )}
                    >
                        <EventTemplateDetailsLeft
                            eventTemplate={eventTemplate}
                            onClose={() => modalStack.close("event-details")}
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
