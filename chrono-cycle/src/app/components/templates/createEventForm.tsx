"use client";

import {
    ActionIcon,
    Button,
    Checkbox,
    Fieldset,
    Group,
    NumberInput,
    Select,
    Stack,
    TagsInput,
    Textarea,
    TextInput,
} from "@mantine/core";
import { TimeInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import { Clock, Plus, Trash } from "lucide-react";
import { zodResolver } from "mantine-form-zod-resolver";
import { useState } from "react";

import { notifyError, notifySuccess } from "@/app/utils/notifications";

import { tagNameSchema } from "@/common/data/domain";

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
}: {
    projectTemplateId: string;
    onSuccess: () => void;
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
        validate: {
            ...zodResolver(payloadSchema),
            tags: (tags) => {
                const badTags = tags
                    .filter((tag) => !tagNameSchema.safeParse(tag).success)
                    .map((tag) => `"${tag}"`);

                if (badTags.length > 0) {
                    const badTagsString =
                        badTags.length > 1
                            ? badTags.slice(0, -1).join(", ") +
                              " and " +
                              badTags.at(-1)
                            : badTags[0];
                    return `Tags can only contain alphanumeric characters, dashes and underscores. Invalid tag(s): ${badTagsString}.`;
                }

                return null;
            },
        },
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
        <form onSubmit={form.onSubmit((values) => mutation.mutate(values))}>
            <Fieldset legend="Basic Information">
                <TextInput
                    label="Name"
                    description="Name of the event"
                    error="Invalid event name"
                    placeholder="Event name"
                    disabled={mutation.isPending}
                    required
                    {...form.getInputProps("name")}
                />
                <NumberInput
                    label="Offset days"
                    description="The number of offset days from the project start date"
                    error="Invalid number of offset days"
                    disabled={mutation.isPending}
                    required
                    {...form.getInputProps("offsetDays")}
                />
                <Group>
                    <Select
                        name="eventType"
                        label="Event type"
                        data={[
                            { label: "Task", value: "task" },
                            { label: "Activity", value: "activity" },
                        ]}
                        placeholder="Event type"
                        description="The type of event (task or activity)"
                        error="Invalid event type"
                        disabled={mutation.isPending}
                        {...form.getInputProps("eventType")}
                    />
                    <NumberInput
                        key={form.key("duration")}
                        label="Duration (days)"
                        min={1}
                        description="The duration of the event in days"
                        error="Invalid duration"
                        disabled={durationDisabled}
                        required
                        {...form.getInputProps("duration")}
                    />
                </Group>
                <Checkbox
                    label="Automatically Reschedule"
                    description="Whether to automatically reschedule the event when a dependency event is delayed"
                    defaultChecked
                    disabled={mutation.isPending}
                    {...form.getInputProps("autoReschedule")}
                />
            </Fieldset>
            <Fieldset legend="Reminders">
                <Stack>
                    {form.getValues().reminders.map((_reminder, index) => (
                        <Fieldset key={`reminder-${index}`}>
                            <Stack>
                                <Group>
                                    <NumberInput
                                        key={form.key(
                                            `reminders.${index}.daysBeforeEvent`,
                                        )}
                                        label="Days before event"
                                        description="The number of days before the event to trigger the reminder"
                                        min={0}
                                        disabled={mutation.isPending}
                                        required
                                        {...form.getInputProps(
                                            `reminders.${index}.daysBeforeEvent`,
                                        )}
                                    />
                                    <TimeInput
                                        key={form.key(
                                            `reminders.${index}.time`,
                                        )}
                                        label="Time"
                                        description="The time at which to trigger the reminder"
                                        disabled={mutation.isPending}
                                        leftSection={<Clock size={16} />}
                                        required
                                        {...form.getInputProps(
                                            `reminders.${index}.time`,
                                        )}
                                    />
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
                                <Checkbox
                                    key={form.key(
                                        `reminders.${index}.emailNotifications`,
                                    )}
                                    label="Email notification"
                                    description="Whether to send an email notification for this reminder"
                                    defaultChecked
                                    disabled={mutation.isPending}
                                    {...form.getInputProps(
                                        `reminders.${index}.emailNotifications`,
                                    )}
                                />
                                <Checkbox
                                    key={form.key(
                                        `reminders.${index}.desktopNotifications`,
                                    )}
                                    label="Desktop notification"
                                    description="Whether to send an desktop notification for this reminder"
                                    defaultChecked
                                    disabled={mutation.isPending}
                                    {...form.getInputProps(
                                        `reminders.${index}.desktopNotifications`,
                                    )}
                                />
                            </Stack>
                        </Fieldset>
                    ))}
                    <Group justify="flex-start">
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
            <Fieldset legend="Miscellaneous">
                <Textarea
                    label="Note"
                    description="Attach a note to the event"
                    error="Invalid note"
                    placeholder="Enter note"
                    disabled={mutation.isPending}
                    {...form.getInputProps("note")}
                />
                {/* TODO: autocomplete tags */}
                <TagsInput
                    label="Tags"
                    description="Assign one or more tag(s) to the event"
                    {...form.getInputProps("tags")}
                />
            </Fieldset>
            <Group justify="flex-end">
                <Button type="submit" loading={mutation.isPending}>
                    Add
                </Button>
            </Group>
        </form>
    );
}
