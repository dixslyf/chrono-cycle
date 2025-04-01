"use client";

import {
    Badge,
    Button,
    Checkbox,
    Fieldset,
    Group,
    NumberInput,
    ScrollArea,
    SegmentedControl,
    Stack,
    TagsInput,
    Text,
    Textarea,
    useModalsStack,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm, zodResolver, type UseFormReturnType } from "@mantine/form";
import {
    useMutation,
    UseMutationResult,
    useQueryClient,
} from "@tanstack/react-query";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { Clock } from "lucide-react";
import { DateTime } from "luxon";
import React, { useEffect } from "react";
import { z } from "zod";

import { EditableTitle } from "@/app/components/customComponent/editableTitle";
import { SplitModal } from "@/app/components/customComponent/splitModal";
import { theme } from "@/app/provider";
import { notifyError, notifySuccess } from "@/app/utils/notifications";
import { queryKeys } from "@/app/utils/queries/keys";

import { Event, Reminder, Tag, tagNameSchema } from "@/common/data/domain";

import { updateEventAction } from "@/features/events/update/action";
import {
    Failure,
    payloadSchema,
    Payload as UpdatePayload,
} from "@/features/events/update/data";

// Removing auto-scheduling because we don't have time to implement it.
type UpdateFormValues = Required<
    Omit<
        UpdatePayload,
        | "id"
        | "startDate"
        | "autoReschedule"
        | "notificationsEnabled"
        | "remindersDelete"
        | "remindersUpdate"
        | "remindersInsert"
    >
> & {
    startDate: Date;
};

function EventDetailsLeft({
    event,
    updateMutation,
    updateForm,
}: {
    event: Event;
    updateMutation: UseMutationResult<Event, Failure, UpdateFormValues>;
    updateForm: UseFormReturnType<UpdateFormValues>;
}): React.ReactNode {
    return (
        <Stack gap="xl" className="h-full">
            <Group grow>
                {/* Not editable because an event's type is not modifiable. */}
                <Text>
                    <Text span fw={500}>
                        Event type:
                    </Text>
                    {event.eventType === "task" ? " Task" : " Activity"}
                </Text>
                <Group>
                    <Text span fw={500}>
                        Status:{" "}
                    </Text>
                    <SegmentedControl
                        fullWidth
                        radius="lg"
                        data={
                            event.eventType === "task"
                                ? [
                                      {
                                          label: "Not Started",
                                          value: "not started",
                                      },
                                      {
                                          label: "In Progress",
                                          value: "in progress",
                                      },
                                      {
                                          label: "Completed",
                                          value: "completed",
                                      },
                                  ]
                                : [{ label: "None", value: "none" }]
                        }
                        disabled={event.eventType === "activity"}
                        {...updateForm.getInputProps("status")}
                    />
                </Group>
            </Group>
            <Group grow>
                <DatePickerInput
                    size="md"
                    label="Start Date"
                    disabled={updateMutation.isPending}
                    required
                    {...updateForm.getInputProps("startDate")}
                />
                <NumberInput
                    size="md"
                    key={updateForm.key("duration")}
                    label="Duration (days)"
                    min={1}
                    error="Invalid duration"
                    disabled={
                        updateMutation.isPending || event.eventType === "task"
                    }
                    required
                    {...updateForm.getInputProps("duration")}
                />
            </Group>
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
                {...updateForm.getInputProps("tags")}
                classNames={{ pill: "bg-gray-200" }}
            />
        </Stack>
    );
}

function EventDetailsRight({
    event,
    updateMutation,
    updateForm,
}: {
    event: Event;
    updateMutation: UseMutationResult<Event, Failure, UpdateFormValues>;
    updateForm: UseFormReturnType<UpdateFormValues>;
}) {
    return (
        <Stack className="h-full" justify="space-between">
            <Fieldset c="white" unstyled className="flex">
                <Stack gap="lg" w="100%">
                    <ScrollArea style={{ root: { flex: 1 } }}>
                        {event.reminders.length > 0 ? (
                            event.reminders.map((reminder: Reminder, index) => (
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
                                    <Group>
                                        <Group>
                                            <Clock className="w-8 h-8" />
                                            <Text>Trigger time:</Text>
                                        </Group>
                                        <Text>
                                            {reminder.triggerTime.toString()}
                                        </Text>
                                    </Group>

                                    <Group>
                                        <Checkbox
                                            checked={
                                                reminder.emailNotifications
                                            }
                                            readOnly
                                            label="Email Notification"
                                        />
                                    </Group>
                                </Stack>
                            ))
                        ) : (
                            <Text>No reminders set</Text>
                        )}
                    </ScrollArea>
                </Stack>
            </Fieldset>

            <Group justify="flex-end">
                <Button
                    type="submit"
                    form="update-event-form"
                    loading={updateMutation.isPending}
                    disabled={!updateForm.isDirty()}
                >
                    Save
                </Button>
            </Group>
        </Stack>
    );
}

export function EventDetailsModal<T extends string>({
    modalStack,
    event,
}: {
    modalStack: ReturnType<typeof useModalsStack<"event-details" | T>>;
    event?: Event;
}) {
    const updateForm = useForm<UpdateFormValues>({
        mode: "uncontrolled",
        initialValues: {
            name: event?.name ?? "",
            startDate: event?.startDate ?? new Date(),
            duration: event?.duration ?? 0,
            note: event?.note ?? "",
            status: event?.status ?? "none",
            tags: event?.tags.map((t) => t.name) ?? [],
        } satisfies UpdateFormValues,
        validate: {
            ...zodResolver(
                payloadSchema.omit({ id: true }).setKey("startDate", z.date()),
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

    // Similar to project template details. Needed for the initial values to show properly.
    // By the time the project template data has been loaded, the form has already
    // been created (with empty strings since those are the fallback). We need to manually
    // reset the form once the event template data has loaded to set the initial values.
    const setFormInitialValues = updateForm.setInitialValues;
    const resetForm = updateForm.reset;
    useEffect(() => {
        if (event) {
            setFormInitialValues({
                name: event.name,
                startDate: event.startDate,
                duration: event.duration,
                note: event.note,
                status: event.status,
                tags: event.tags.map((t) => t.name),
            });
            resetForm();
        }
    }, [event, setFormInitialValues, resetForm]);

    const queryClient = useQueryClient();
    const updateMutation = useMutation({
        mutationFn: async (values: UpdateFormValues) => {
            // Convert start date to string.
            const { startDate: startDateJS, ...rest } = values;
            const startDate = DateTime.fromJSDate(
                startDateJS,
            ).toISODate() as string;

            // Safety: If we've reached this point, event should be defined.
            const result = await updateEventAction(null, {
                id: event?.id as string,
                startDate,
                remindersDelete: [],
                remindersInsert: [],
                remindersUpdate: [],
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
            notifySuccess({
                message: "Successfully updated event template!",
            });

            queryClient.invalidateQueries({
                queryKey: queryKeys.projects.listAll(),
            });

            updateForm.resetDirty();
        },
        onError: (_err: Failure) => {
            notifyError({ message: "Failed to update event template." });
        },
    });

    return (
        <SplitModal {...modalStack.register("event-details")}>
            <form
                id="update-event-form"
                onSubmit={updateForm.onSubmit((values) =>
                    updateMutation.mutate(values),
                )}
            />
            {event && (
                <>
                    <SplitModal.Left
                        title={`${event.name}`}
                        titleComponent={() => (
                            <EditableTitle
                                key={updateForm.key("name")}
                                disabled={updateMutation.isPending}
                                {...updateForm.getInputProps("name")}
                            />
                        )}
                    >
                        <EventDetailsLeft
                            event={event}
                            updateForm={updateForm}
                            updateMutation={updateMutation}
                        />
                    </SplitModal.Left>
                    <SplitModal.Right title="Reminders">
                        <EventDetailsRight
                            event={event}
                            updateForm={updateForm}
                            updateMutation={updateMutation}
                        />
                    </SplitModal.Right>
                </>
            )}
        </SplitModal>
    );
}
