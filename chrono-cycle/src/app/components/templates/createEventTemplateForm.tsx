"use client";

import {
    ActionIcon,
    Button,
    Checkbox,
    Fieldset,
    Group,
    NumberInput,
    ScrollArea,
    Select,
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
import { Calendar, Clock, Plus, Trash } from "lucide-react";
import { zodResolver } from "mantine-form-zod-resolver";
import { useState } from "react";

import { theme } from "@/app/provider";
import { notifyError, notifySuccess } from "@/app/utils/notifications";
import { queryKeys } from "@/app/utils/queries/keys";

import { EventTemplate, tagNameSchema } from "@/common/data/domain";

import { createEventTemplateAction } from "@/features/event-templates/create/action";
import {
    Failure,
    Payload,
    payloadSchema,
    rawPayloadSchema,
    refineRawPayloadSchema,
} from "@/features/event-templates/create/data";

type ReminderData = Required<Payload["reminders"][number]>;

export interface CreateEventTemplateFormState {
    form: ReturnType<typeof useForm<Omit<Payload, "projectTemplateId">>>;
    mutation: ReturnType<
        typeof useMutation<
            EventTemplate,
            Failure,
            Omit<Payload, "projectTemplateId">
        >
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
    const form = useForm<Omit<Payload, "projectTemplateId">>({
        mode: "uncontrolled",
        initialValues: {
            name: "",
            offsetDays: 0,
            eventType: "task",
            duration: 1,
            note: "",
            autoReschedule: true,
            reminders: [] as ReminderData[],
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
    type FormValues = typeof form.values;

    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: async (values: FormValues) => {
            const result = await createEventTemplateAction({
                projectTemplateId,
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
                        {/* offset days */}
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
            <RemindersInput form={form} mutation={mutation} />
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

function RemindersInput({
    form,
    mutation,
}: {
    form: CreateEventTemplateFormState["form"];
    mutation: CreateEventTemplateFormState["mutation"];
}) {
    return (
        <Fieldset c="white" unstyled style={{ display: "flex" }}>
            <Stack gap="lg" w="100%">
                <ScrollArea style={{ root: { flex: 1 } }}>
                    <Stack gap="lg" style={{ flex: 1 }}>
                        {form.values.reminders.length > 0 ? (
                            form.values.reminders.map((_reminder, index) => (
                                <Stack
                                    key={`reminder-${index}`}
                                    styles={{
                                        root: {
                                            border: "1px solid",
                                            borderColor: theme.white,
                                        },
                                    }}
                                    className="rounded-lg p-4"
                                    justify="center"
                                >
                                    <Group gap="xl" grow>
                                        <NumberInput
                                            label="Days before event"
                                            leftSection={<Calendar />}
                                            min={0}
                                            disabled={mutation.isPending}
                                            required
                                            {...form.getInputProps(
                                                `reminders.${index}.daysBeforeEvent`,
                                            )}
                                        />
                                        <TimeInput
                                            label="Trigger time"
                                            leftSection={<Clock />}
                                            disabled={mutation.isPending}
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
                                            disabled={mutation.isPending}
                                            {...form.getInputProps(
                                                `reminders.${index}.emailNotifications`,
                                                { type: "checkbox" },
                                            )}
                                        />
                                        {/* delete button */}
                                        <Group
                                            justify="flex-end"
                                            className="flex-grow"
                                        >
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
                                    </Group>
                                </Stack>
                            ))
                        ) : (
                            <Text c="white">No reminders set</Text>
                        )}
                    </Stack>
                </ScrollArea>
                <Group justify="flex-end">
                    <Button
                        leftSection={<Plus />}
                        onClick={() =>
                            form.insertListItem(
                                "reminders",
                                {
                                    daysBeforeEvent: 0,
                                    time: "09:00",
                                    emailNotifications: true,
                                    desktopNotifications: true,
                                },
                                0,
                            )
                        }
                    >
                        Add Reminder
                    </Button>
                </Group>
            </Stack>
        </Fieldset>
    );
}
