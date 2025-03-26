"use client";

import {
    ActionIcon,
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
    TextInput,
} from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import { Calendar, Clock, Plus, Trash, X } from "lucide-react";
import { zodResolver } from "mantine-form-zod-resolver";
import { useState } from "react";

import { notifyError, notifySuccess } from "@/app/utils/notifications";

import { EventTemplate } from "@/common/data/domain";

import { createEventTemplateAction } from "@/features/event-templates/create/action";
import {
    Failure,
    Payload,
    payloadSchema,
} from "@/features/event-templates/create/data";

type ReminderData = Required<Payload["reminders"][number]>;

export interface CreateEventTemplateFormState {
    form: ReturnType<typeof useForm<Payload>>;
    mutation: ReturnType<typeof useMutation<EventTemplate, Failure, Payload>>;
    durationDisabled: boolean;
}

export function CreateEventTemplateFormState({
    projectTemplateId,
    onSuccess,
}: {
    projectTemplateId: string;
    onSuccess: () => void;
}): CreateEventTemplateFormState {
    const form = useForm<Payload>({
        mode: "uncontrolled",
        initialValues: {
            name: "",
            offsetDays: 0,
            eventType: "task",
            duration: 1,
            note: "",
            autoReschedule: true,
            projectTemplateId, // Sqid, not the actual ID.
            reminders: [] as ReminderData[],
            tags: [] as string[],
        },
        validate: zodResolver(payloadSchema),
    });
    type FormValues = typeof form.values;

    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async (values: FormValues) => {
            const result = await createEventTemplateAction(values);
            return pipe(
                result,
                E.getOrElseW((err) => {
                    throw err;
                }),
            );
        },
        onSuccess: () => {
            // Call `onSuccess` whenever creation is successful + show notifications.
            queryClient.invalidateQueries({
                queryKey: ["retrieve-project-template"],
            });
            notifySuccess({
                message: "Successfully created event.",
            });
            onSuccess();
        },
        onError: (_err: Failure) =>
            notifyError({
                message: `Failed to create event.`,
            }),
    });

    // Disable duration field and set it to 1 when event type is set to "task".
    const [durationDisabled, setDurationDisabled] = useState(true);
    form.watch("eventType", (change) => {
        if (change.value === "task") {
            form.setFieldValue("duration", 1);
        }
        setDurationDisabled(mutation.isPending || change.value === "task");
    });

    return { form, mutation, durationDisabled };
}

export function CreateEventTemplateFormLeft({
    form,
    mutation,
}: {
    form: CreateEventTemplateFormState["form"];
    mutation: CreateEventTemplateFormState["mutation"];
}): React.ReactNode {
    return (
        <Stack className="h-full overflow-y-auto" align="stretch" gap="xl">
            <form
                id="create-event-form"
                onSubmit={form.onSubmit((values) => mutation.mutate(values))}
                className="h-full"
            >
                <Stack gap="xl" className="h-full">
                    {/* header */}
                    <Text className="text-3xl font-bold">
                        Create Event Template
                    </Text>
                    {/* name input */}
                    <TextInput
                        label="Event Name"
                        size="md"
                        placeholder="Event name"
                        disabled={mutation.isPending}
                        error="Invalid event name"
                        required
                        {...form.getInputProps("name")}
                        className="border-none"
                    />
                    {/* notes */}
                    <Textarea
                        label="Notes"
                        size="md"
                        placeholder="Enter note"
                        disabled={mutation.isPending}
                        error="Invalid note"
                        {...form.getInputProps("note")}
                    />
                    <Fieldset
                        legend="Reminders"
                        className="border-gray-400 rounded-xl flex-1"
                    >
                        <Stack gap="lg">
                            <SimpleGrid cols={2} className="w-full">
                                {form.getValues().reminders.length > 0 ? (
                                    form
                                        .getValues()
                                        .reminders.map((reminder, index) => (
                                            <Stack
                                                key={`reminder-${index}`}
                                                className="border border-gray-400 rounded-lg p-4"
                                                justify="center"
                                            >
                                                {/* days before event */}
                                                <Group gap="xl">
                                                    <Group gap="md">
                                                        <Calendar className="w-8 h-8" />
                                                        <Text>
                                                            Days before event:
                                                        </Text>
                                                    </Group>
                                                    <NumberInput
                                                        label=""
                                                        min={0}
                                                        disabled={
                                                            mutation.isPending
                                                        }
                                                        required
                                                        {...form.getInputProps(
                                                            `reminders.${index}.daysBeforeEvent`,
                                                        )}
                                                    />
                                                </Group>
                                                {/* trigger time */}
                                                <Group gap="xl">
                                                    <Group gap="md">
                                                        <Clock className="w-8 h-8" />
                                                        <Text>
                                                            Trigger time:
                                                        </Text>
                                                    </Group>
                                                    <TimeInput
                                                        disabled={
                                                            mutation.isPending
                                                        }
                                                        leftSection={
                                                            <Clock size={16} />
                                                        }
                                                        required
                                                        {...form.getInputProps(
                                                            `reminders.${index}.time`,
                                                        )}
                                                    />
                                                </Group>
                                                {/* notification */}
                                                <Group>
                                                    <Checkbox
                                                        label="Email notification"
                                                        disabled={
                                                            mutation.isPending
                                                        }
                                                        {...form.getInputProps(
                                                            `reminders.${index}.emailNotifications`,
                                                        )}
                                                    />
                                                    <Checkbox
                                                        label="Desktop notification"
                                                        disabled={
                                                            mutation.isPending
                                                        }
                                                        {...form.getInputProps(
                                                            `reminders.${index}.desktopNotifications`,
                                                        )}
                                                    />
                                                </Group>
                                                {/* delete button */}
                                                <Group justify="flex-end">
                                                    <ActionIcon
                                                        color="red"
                                                        onClick={() =>
                                                            form.removeListItem(
                                                                "reminders",
                                                                index,
                                                            )
                                                        }
                                                    >
                                                        <Trash />
                                                    </ActionIcon>
                                                </Group>
                                            </Stack>
                                        ))
                                ) : (
                                    <Text>No reminders set</Text>
                                )}
                            </SimpleGrid>
                            <Group>
                                <Button
                                    leftSection={<Plus />}
                                    onClick={() =>
                                        form.insertListItem("reminders", {
                                            daysBeforeEvent: 1,
                                            time: "09:00",
                                            emailNotifications: true,
                                            desktopNotifications: true,
                                        })
                                    }
                                >
                                    Add Reminder
                                </Button>
                            </Group>
                        </Stack>
                    </Fieldset>
                </Stack>
            </form>
        </Stack>
    );
}

export function CreateEventTemplateFormRight({
    form,
    mutation,
    durationDisabled,
}: {
    form: CreateEventTemplateFormState["form"];
    mutation: CreateEventTemplateFormState["mutation"];
    durationDisabled: boolean;
}): React.ReactNode {
    return (
        <Stack className="h-full" justify="space-between">
            <Stack>
                {/* offset days, auto reschedule, event type, duration */}
                <SimpleGrid cols={2}>
                    {/* offset days */}
                    <Group className="pb-4">
                        <NumberInput
                            size="md"
                            label="Offset days"
                            error="Invalid number of offset days"
                            disabled={mutation.isPending}
                            required
                            {...form.getInputProps("offsetDays")}
                            className="text-palette3"
                        />
                    </Group>
                    {/* auto reschedule */}
                    <Group className="py-4">
                        <Checkbox
                            size="md"
                            label="Automatically Reschedule"
                            defaultChecked
                            disabled={mutation.isPending}
                            {...form.getInputProps("autoReschedule")}
                            className="text-palette3"
                        />
                    </Group>
                    {/* event type */}
                    <Group className="py-4">
                        <Select
                            size="md"
                            name="eventType"
                            label="Event Type"
                            data={[
                                { label: "Task", value: "task" },
                                { label: "Activity", value: "activity" },
                            ]}
                            placeholder="Event type"
                            error="Invalid event type"
                            disabled={mutation.isPending}
                            {...form.getInputProps("eventType")}
                            className="text-palette3"
                        />
                    </Group>
                    {/* duration */}
                    <Group className="py-4">
                        <NumberInput
                            size="md"
                            key={form.key("duration")}
                            label="Duration (days)"
                            min={1}
                            error="Invalid duration"
                            disabled={durationDisabled}
                            required
                            {...form.getInputProps("duration")}
                            className="text-palette3"
                        />
                    </Group>
                </SimpleGrid>
                <Stack gap="sm" className="py-4">
                    <TagsInput
                        size="md"
                        label="Tags"
                        placeholder="Add a Tag"
                        {...form.getInputProps("tags")}
                        className="text-palette3"
                        classNames={{ pill: "bg-gray-200" }}
                    />
                </Stack>
            </Stack>
            <Group justify="flex-end">
                <Button
                    type="submit"
                    form="create-event-form"
                    loading={mutation.isPending}
                >
                    Add
                </Button>
            </Group>
        </Stack>
    );
}
