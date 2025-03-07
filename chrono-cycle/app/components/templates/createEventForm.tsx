"use client";

import * as E from "fp-ts/Either";
import { useActionState, useEffect, useState } from "react";
import { match, P } from "ts-pattern";
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

import { ValidationIssues } from "@/server/common/errors";
import { Textarea, TextInput } from "@mantine/core";
import { pipe } from "fp-ts/lib/function";

import { notifyError, notifySuccess } from "@/app/utils/notifications";
import { createEventTemplateAction } from "@/server/event-templates/create/action";
import {
    CreateFormData as CreateEventTemplateFormData,
    createFormDataSchema,
    CreateResult,
} from "@/server/event-templates/create/data";
import { Clock, Plus, Trash } from "lucide-react";

type ReminderData = Required<CreateEventTemplateFormData["reminders"][number]>;

function getCreateErrorMessage(createState: CreateResult) {
    return match(createState)
        .with(
            { left: { _errorKind: "ValidationError" } },
            () => "Invalid or missing fields",
        )
        .with(
            { left: { _errorKind: "DoesNotExistError" } },
            () => "Project template does not exist",
        )
        .with(
            { left: { _errorKind: "InternalError" } },
            () => "An internal error occurred",
        )
        .with({ left: { _errorKind: "TagExistsError" } }, () => "Tag exists")
        .with({ right: P.any }, () => "")
        .exhaustive();
}

function extractValidationIssues(
    createState: CreateResult | null,
): ValidationIssues<
    | "name"
    | "offsetDays"
    | "duration"
    | "note"
    | "eventType"
    | "autoReschedule"
    | "projectTemplateId"
> {
    const noIssue = {
        name: [],
        offsetDays: [],
        duration: [],
        note: [],
        eventType: [],
        autoReschedule: [],
        projectTemplateId: [],
    };

    if (!createState) {
        return noIssue;
    }

    return match(createState)
        .with(
            {
                _tag: "Left",
                left: { _errorKind: "ValidationError", issues: P.select() },
            },
            (issues) => ({ ...noIssue, ...issues }),
        )
        .otherwise(() => noIssue);
}

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
                        message: `Failed to create project template. ${_err}`,
                    }),
                () => {
                    notifySuccess({
                        message: "Successfully created project template.",
                    });
                    onSuccess();
                },
            ),
        );
    }, [createResult, onSuccess]);

    const form = useForm({
        mode: "uncontrolled",
        initialValues: {
            name: "",
            offsetDays: 0,
            eventType: "task",
            duration: 0,
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
        <form action={createAction}>
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
                                    required
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
                                    required
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
