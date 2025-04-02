"use client";

import {
    Button,
    Group,
    NumberInput,
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
import { DateTime } from "luxon";
import React, { useEffect } from "react";
import { z } from "zod";

import { EditableTitle } from "@/app/components/customComponent/editableTitle";
import {
    RemindersInput,
    RemindersInputEntry,
} from "@/app/components/customComponent/remindersInput";
import { SplitModal } from "@/app/components/customComponent/splitModal";
import { notifyError, notifySuccess } from "@/app/utils/notifications";
import { queryKeys } from "@/app/utils/queries/keys";

import { Event, Reminder, tagNameSchema } from "@/common/data/domain";
import {
    calculateDaysDiff,
    extractTimeStringComponents,
    extractTimeStringFromJSDate,
} from "@/common/dates";

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
    reminders: (RemindersInputEntry & Partial<Reminder>)[];
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
    updateMutation,
    updateForm,
}: {
    updateMutation: UseMutationResult<Event, Failure, UpdateFormValues>;
    updateForm: UseFormReturnType<UpdateFormValues>;
}) {
    return (
        <Stack className="h-full" justify="space-between">
            <RemindersInput
                entries={updateForm.getValues().reminders}
                daysBeforeEventInputProps={(index) => ({
                    key: updateForm.key(`reminders.${index}.daysBeforeEvent`),
                    ...updateForm.getInputProps(
                        `reminders.${index}.daysBeforeEvent`,
                    ),
                })}
                triggerTimeInputProps={(index) => ({
                    key: updateForm.key(`reminders.${index}.time`),
                    ...updateForm.getInputProps(`reminders.${index}.time`),
                })}
                emailNotificationsInputProps={(index) => ({
                    key: updateForm.key(
                        `reminders.${index}.emailNotifications`,
                    ),
                    ...updateForm.getInputProps(
                        `reminders.${index}.emailNotifications`,
                        { type: "checkbox" },
                    ),
                })}
                onReminderDelete={(index) =>
                    updateForm.removeListItem("reminders", index)
                }
                onReminderAdd={(defaultEntry) =>
                    updateForm.insertListItem("reminders", defaultEntry)
                }
                disabled={updateMutation.isPending}
            />

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
            // Note: This requires pre-processing before sending to the server.
            // Also, we re-use the reminder's ID as the key.
            reminders:
                event?.reminders.map((r) => ({
                    key: r.id,
                    id: r.id,
                    daysBeforeEvent: calculateDaysDiff(
                        r.triggerTime,
                        event.startDate,
                    ),
                    time: extractTimeStringFromJSDate(r.triggerTime),
                    emailNotifications: r.emailNotifications,
                })) ?? [],
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
                reminders:
                    event.reminders.map((r) => ({
                        key: r.id,
                        id: r.id,
                        daysBeforeEvent: calculateDaysDiff(
                            r.triggerTime,
                            event.startDate,
                        ),
                        time: extractTimeStringFromJSDate(r.triggerTime),
                        emailNotifications: r.emailNotifications,
                    })) ?? [],
            });
            resetForm();
        }
    }, [event, setFormInitialValues, resetForm]);

    const queryClient = useQueryClient();
    const updateMutation = useMutation({
        mutationFn: async (values: UpdateFormValues) => {
            // Safety: If we've reached this point, event cannot be undefined.
            const oldEv = event as Event;

            const {
                startDate: startDateJS,
                reminders: formReminders,
                ...rest
            } = values;

            const newStartDate = DateTime.fromJSDate(startDateJS);

            // Convert the time and date into a single ISO date time string.
            const newReminders = formReminders.map((r) =>
                pipe(
                    extractTimeStringComponents(r.time),
                    E.map(
                        ({ hours: hour, minutes: minute }) =>
                            newStartDate
                                .minus({ days: r.daysBeforeEvent })
                                .set({ hour, minute })
                                .toUTC()
                                .toISO() as string,
                    ),
                    E.getOrElseW((err) => {
                        throw err;
                    }),
                    (triggerTime) => ({
                        id: r.id,
                        triggerTime,
                        emailNotifications: r.emailNotifications,
                    }),
                ),
            );

            console.log("newReminders", newReminders);

            // The ones to insert are those without an ID.
            const remindersInsert = newReminders.filter(
                (r) => r.id === undefined,
            );

            // "Survivors" means those existing reminder templates that
            // have not been removed.
            const newRemindersSurvivors = newReminders.filter(
                (r) => r.id !== undefined,
            ) as {
                id: string;
                triggerTime: string;
                emailNotifications: boolean;
            }[];

            // The ones to delete are those that are not in the survivors list.
            const newRemindersSurvivorIds = new Set(
                newRemindersSurvivors.map((r) => r.id),
            );
            const remindersDelete = oldEv.reminders
                .map((r) => r.id)
                .filter((id) => !newRemindersSurvivorIds.has(id));

            // The ones that need to be updated are those in the survivors list
            // that are dirty.
            // Note that if the event's date has been modified, then all survivors
            // need to be updated.
            const eventReminderMap = new Map(
                oldEv.reminders.map((r) => [r.id, r] as const),
            );
            const remindersUpdate = newRemindersSurvivors.filter((r) => {
                // Safety: Guaranteed to be defined since we constructed the map earlier.
                const evReminder = eventReminderMap.get(r.id) as Reminder;
                return (
                    r.triggerTime !==
                        DateTime.fromJSDate(evReminder.triggerTime)
                            .toUTC()
                            .toISO() ||
                    r.emailNotifications !== evReminder.emailNotifications
                );
            });

            // Safety: If we've reached this point, event should be defined.
            const result = await updateEventAction(null, {
                id: event?.id as string,
                startDate: newStartDate.toISODate() as string,
                remindersDelete,
                remindersInsert,
                remindersUpdate,
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
                            updateForm={updateForm}
                            updateMutation={updateMutation}
                        />
                    </SplitModal.Right>
                </>
            )}
        </SplitModal>
    );
}
