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

import { createEventTemplateAction } from "@/features/event-templates/create/action";
import {
    Failure,
    Payload,
    payloadSchema,
} from "@/features/event-templates/create/data";

type ReminderData = Required<Payload["reminders"][number]>;

export function CreateEventTemplateForm({
    projectTemplateId,
    onSuccess,
    onClose,
}: {
    projectTemplateId: string;
    onSuccess: () => void;
    onClose: () => void;
}): React.ReactNode {
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

    return (
        <Group className="w-full h-full gap-0  items-stretch">
            {/* left panel */}
            <Stack className="w-3/5 py-8 px-12 h-full overflow-y-auto" gap="xl">
                <form
                    id="create-event-form"
                    onSubmit={form.onSubmit((values) =>
                        mutation.mutate(values),
                    )}
                >
                    <Stack gap="xl">
                        {/* header */}
                        <Text className="text-3xl font-bold">
                            Create Event Template
                        </Text>
                        {/* name input */}
                        <TextInput
                            size="lg"
                            placeholder="Event name"
                            disabled={mutation.isPending}
                            error="Invalid event name"
                            required
                            {...form.getInputProps("name")}
                        />
                        {/* notes */}
                        <Textarea
                            size="lg"
                            placeholder="Enter note"
                            disabled={mutation.isPending}
                            error="Invalid note"
                            {...form.getInputProps("note")}
                        />
                        <Fieldset
                            legend="Reminders"
                            className="border-gray-400"
                        >
                            <Stack gap="lg">
                                <SimpleGrid cols={2} className="w-full">
                                    {form.getValues().reminders.length > 0 ? (
                                        form
                                            .getValues()
                                            .reminders.map(
                                                (reminder, index) => (
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
                                                                    Days before
                                                                    event:
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
                                                                    Trigger
                                                                    time:
                                                                </Text>
                                                            </Group>
                                                            <TimeInput
                                                                disabled={
                                                                    mutation.isPending
                                                                }
                                                                leftSection={
                                                                    <Clock
                                                                        size={
                                                                            16
                                                                        }
                                                                    />
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
                                                ),
                                            )
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
            {/* right panel */}
            <Stack
                className="py-8 px-4 w-2/5 items-stretch bg-palette1"
                justify="space-between"
            >
                <Stack>
                    {/* close button */}
                    <Group justify="flex-end">
                        <X
                            className="text-palette3 hover:text-gray-400 cursor-pointer w-8 h-8"
                            onClick={onClose}
                        />
                    </Group>
                    {/* offset days, auto reschedule, event type, duration */}
                    <SimpleGrid cols={2}>
                        {/* offset days */}
                        <Group className="p-4">
                            <NumberInput
                                size="lg"
                                label="Offset days"
                                error="Invalid number of offset days"
                                disabled={mutation.isPending}
                                required
                                {...form.getInputProps("offsetDays")}
                                className="text-palette3"
                            />
                        </Group>
                        {/* auto reschedule */}
                        <Group className="p-4">
                            <Checkbox
                                size="lg"
                                label="Automatically Reschedule"
                                defaultChecked
                                disabled={mutation.isPending}
                                {...form.getInputProps("autoReschedule")}
                                className="text-palette3"
                            />
                        </Group>
                        {/* event type */}
                        <Group className="p-4">
                            <Select
                                size="lg"
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
                        <Group className="p-4">
                            <NumberInput
                                size="lg"
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
                    <Stack gap="sm" className="p-4">
                        <TagsInput
                            size="lg"
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
        </Group>
    );
}
