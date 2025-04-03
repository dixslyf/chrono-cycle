"use client";

import {
    Button,
    Group,
    NumberInput,
    Select,
    Stack,
    TagsInput,
    Textarea,
    TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/lib/function";
import { zodResolver } from "mantine-form-zod-resolver";
import { useState } from "react";

import {
    RemindersInput,
    RemindersInputEntry,
} from "@/app/components/customComponent/remindersInput";
import { notifyError, notifySuccess } from "@/app/utils/notifications";
import { queryKeys } from "@/app/utils/queries/keys";

import { EventTemplate, tagNameSchema } from "@/common/data/domain";

import { createEventTemplateAction } from "@/features/event-templates/create/action";
import {
    Failure,
    Payload,
    rawPayloadSchema,
    refineRawPayloadSchema,
} from "@/features/event-templates/create/data";

type FormValues = Omit<Payload, "projectTemplateId" | "reminders"> & {
    offsetWeeks: number;
    reminders: RemindersInputEntry[];
};

export interface CreateEventTemplateFormState {
    form: ReturnType<typeof useForm<FormValues>>;
    mutation: ReturnType<
        typeof useMutation<EventTemplate, Failure, FormValues>
    >;
    durationDisabled: boolean;
}

export function CreateEventTemplateFormState({
    projectTemplateId,
    onSuccess,
}: {
    projectTemplateId: string;
    onSuccess: () => void;
}): CreateEventTemplateFormState {
    const form = useForm<FormValues>({
        mode: "uncontrolled",
        initialValues: {
            name: "",
            offsetWeeks: 0,
            offsetDays: 0,
            eventType: "task",
            duration: 1,
            note: "",
            autoReschedule: true,
            reminders: [] as RemindersInputEntry[],
            tags: [] as string[],
        },
        validate: {
            ...zodResolver(
                refineRawPayloadSchema(
                    rawPayloadSchema.omit({ projectTemplateId: true }),
                ),
            ),
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

    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async (values: FormValues) => {
            const { offsetWeeks, offsetDays: mOffsetDays, ...rest } = values;
            const offsetDays = offsetWeeks * 7 + mOffsetDays;
            const result = await createEventTemplateAction({
                projectTemplateId,
                offsetDays,
                ...rest,
            });
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
                queryKey: queryKeys.projectTemplates.retrieveBase(),
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
    durationDisabled,
}: {
    form: CreateEventTemplateFormState["form"];
    mutation: CreateEventTemplateFormState["mutation"];
    durationDisabled: CreateEventTemplateFormState["durationDisabled"];
}): React.ReactNode {
    return (
        <Stack className="h-full overflow-y-auto" align="stretch" gap="xl">
            <form
                id="create-event-form"
                onSubmit={(e) => {
                    e.stopPropagation();
                    const formSubmit = form.onSubmit((values) =>
                        mutation.mutate(values),
                    );
                    return formSubmit(e);
                }}
                className="h-full"
            >
                <Stack gap="xl" className="h-full">
                    {/* name input */}
                    <TextInput
                        label="Event Name"
                        description="The name of the event"
                        size="md"
                        placeholder="Event name"
                        disabled={mutation.isPending}
                        error="Invalid event name"
                        required
                        {...form.getInputProps("name")}
                        className="border-none"
                    />
                    {/* event type */}
                    <Select
                        size="md"
                        name="eventType"
                        label="Event Type"
                        description="The type of the event (task or activity)"
                        data={[
                            { label: "Task", value: "task" },
                            {
                                label: "Activity",
                                value: "activity",
                            },
                        ]}
                        placeholder="Event type"
                        error="Invalid event type"
                        disabled={mutation.isPending}
                        {...form.getInputProps("eventType")}
                    />
                    <Group grow>
                        {/* offset weeks and days */}
                        <NumberInput
                            size="md"
                            label="Offset weeks"
                            description="The number of weeks from the project start date"
                            error="Invalid number of offset weeks"
                            disabled={mutation.isPending}
                            required
                            {...form.getInputProps("offsetWeeks")}
                        />
                        <NumberInput
                            size="md"
                            label="Offset days"
                            description="The number of days from the project start date"
                            error="Invalid number of offset days"
                            disabled={mutation.isPending}
                            required
                            {...form.getInputProps("offsetDays")}
                        />
                        {/* duration */}
                        <NumberInput
                            size="md"
                            key={form.key("duration")}
                            label="Duration (days)"
                            description="The duration of the event in days"
                            min={1}
                            error="Invalid duration"
                            disabled={durationDisabled}
                            required
                            {...form.getInputProps("duration")}
                        />
                    </Group>
                    {/* note */}
                    <Textarea
                        label="Note"
                        description="An optional note to attach to the event"
                        size="md"
                        placeholder="Enter note"
                        disabled={mutation.isPending}
                        error="Invalid note"
                        minRows={3}
                        maxRows={3}
                        {...form.getInputProps("note")}
                    />
                    <TagsInput
                        size="md"
                        label="Tags"
                        description="Tags to attach to the event"
                        placeholder="Add a Tag"
                        {...form.getInputProps("tags")}
                        classNames={{ pill: "bg-gray-200" }}
                    />
                </Stack>
            </form>
        </Stack>
    );
}

export function CreateEventTemplateFormRight({
    form,
    mutation,
}: {
    form: CreateEventTemplateFormState["form"];
    mutation: CreateEventTemplateFormState["mutation"];
}): React.ReactNode {
    return (
        <Stack className="h-full" justify="space-between">
            <RemindersInput
                entries={form.getValues().reminders}
                daysBeforeEventInputProps={(index) => ({
                    key: form.key(`reminders.${index}.daysBeforeEvent`),
                    ...form.getInputProps(`reminders.${index}.daysBeforeEvent`),
                })}
                triggerTimeInputProps={(index) => ({
                    key: form.key(`reminders.${index}.time`),
                    ...form.getInputProps(`reminders.${index}.time`),
                })}
                emailNotificationsInputProps={(index) => ({
                    key: form.key(`reminders.${index}.emailNotifications`),
                    ...form.getInputProps(
                        `reminders.${index}.emailNotifications`,
                        { type: "checkbox" },
                    ),
                })}
                onReminderDelete={(index) =>
                    form.removeListItem("reminders", index)
                }
                onReminderAdd={(defaultEntry) =>
                    form.insertListItem("reminders", defaultEntry)
                }
                disabled={mutation.isPending}
            />
            <Group justify="flex-end">
                <Button
                    type="submit"
                    form="create-event-form"
                    loading={mutation.isPending}
                >
                    Create
                </Button>
            </Group>
        </Stack>
    );
}
