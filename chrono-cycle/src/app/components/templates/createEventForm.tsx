"use client";

import * as E from "fp-ts/Either";
import { startTransition, useActionState, useEffect, useState } from "react";
import { useForm } from "@mantine/form";
import { zodResolver } from "mantine-form-zod-resolver";
import {
    Button,
    Checkbox,
    Group,
    NumberInput,
    NativeSelect,
    TagsInput,
    Fieldset,
    Stack,
    ActionIcon,
} from "@mantine/core";
import { TimeInput } from "@mantine/dates";

import { Textarea, TextInput } from "@mantine/core";
import { pipe } from "fp-ts/lib/function";

import { notifyError, notifySuccess } from "@/app/utils/notifications";
import { createEventTemplateAction } from "@/server/features/event-templates/create/action";
import {
    CreateFormData as CreateEventTemplateFormData,
    CreateFormData,
    createFormDataSchema,
} from "@/server/features/event-templates/create/data";
import { Clock, Plus, Trash } from "lucide-react";

type ReminderData = Required<CreateEventTemplateFormData["reminders"][number]>;

export function CreateEventTemplateForm({
    projectTemplateId,
    onSuccess,
}: {
    projectTemplateId: string;
    onSuccess: () => void;
}): React.ReactNode {
    // Action state for creating a project template.
    const [createResult, createAction, createPending] = useActionState(
        createEventTemplateAction,
        null,
    );

    // Call `onSuccess` whenever creation is successful + show notifications.
    useEffect(() => {
        if (!createResult) {
            return;
        }

        pipe(
            createResult,
            E.match(
                (_err) =>
                    notifyError({
                        message: `Failed to create event.`,
                    }),
                () => {
                    notifySuccess({
                        message: "Successfully created event.",
                    });
                    onSuccess();
                },
            ),
        );
    }, [createResult, onSuccess]);

    const form = useForm<CreateFormData>({
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
        validate: zodResolver(createFormDataSchema),
    });

    // Disable duration field and set it to 1 when event type is set to "task".
    const [durationDisabled, setDurationDisabled] = useState(true);
    form.watch("eventType", (change) => {
        if (change.value === "task") {
            form.setFieldValue("duration", 1);
        }
        setDurationDisabled(createPending || change.value === "task");
    });

    useEffect(() => {
        console.log(form.getValues());
    }, [form]);

    return (
        <form
            onSubmit={form.onSubmit((values) =>
                startTransition(() => createAction(values)),
            )}
        >
            <Fieldset legend="Basic Information">
                <TextInput
                    label="Name"
                    description="Name of the event"
                    error="Invalid event name"
                    placeholder="Event name"
                    disabled={createPending}
                    required
                    {...form.getInputProps("name")}
                />
                <NumberInput
                    label="Offset days"
                    description="The number of offset days from the project start date"
                    error="Invalid number of offset days"
                    disabled={createPending}
                    required
                    {...form.getInputProps("offsetDays")}
                />
                <Group>
                    <NativeSelect
                        name="eventType"
                        label="Event type"
                        data={[
                            { label: "Task", value: "task" },
                            { label: "Activity", value: "activity" },
                        ]}
                        description="The type of event (task or activity)"
                        error="Invalid event type"
                        disabled={createPending}
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
                    disabled={createPending}
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
                                        disabled={createPending}
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
                                        disabled={createPending}
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
                                    disabled={createPending}
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
                                    disabled={createPending}
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
                    disabled={createPending}
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
                <Button type="submit" loading={createPending}>
                    Add
                </Button>
            </Group>
        </form>
    );
}
