"use client";

import {
    Badge,
    Checkbox,
    Fieldset,
    Group,
    ScrollArea,
    Stack,
    Text,
    useModalsStack,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { Clock } from "lucide-react";
import { DateTime } from "luxon";
import React, { useEffect } from "react";

import { SplitModal } from "@/app/components/customComponent/splitModal";
import { theme } from "@/app/provider";
import { notifyError, notifySuccess } from "@/app/utils/notifications";
import { queryKeys } from "@/app/utils/queries/keys";

import { Event, Reminder, Tag } from "@/common/data/domain";

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

function EventDetailsLeft({ event }: { event: Event }): React.ReactNode {
    return (
        <Stack className="h-full overflow-y-auto" align="stretch" gap="xl">
            {/* Event type */}
            <Group className="py-4" gap="lg" grow={true}>
                <Group>
                    <Text className="text-md font-semibold text-palette5">
                        Event Type
                    </Text>
                    <Text
                        className={`text-md font-semibold ${
                            event.eventType === "task"
                                ? "text-fuchsia-500"
                                : "text-blue-400"
                        }`}
                    >
                        {event.eventType === "task" ? "Task" : "Activity"}
                    </Text>
                </Group>
                <Group>
                    <Text className="text-md font-semibold text-palette5">
                        Status
                    </Text>
                    <Badge
                        tt="uppercase"
                        color={
                            event.status === "completed"
                                ? "green"
                                : event.status === "in progress"
                                  ? "blue"
                                  : event.status === "not started"
                                    ? "yellow"
                                    : "gray"
                        }
                    >
                        {event.status}
                    </Badge>
                </Group>
            </Group>
            <Group className="py-4" gap="lg" grow={true}>
                {/* start date */}
                <Group gap={0}>
                    <Text className="text-md font-semibold text-palette5 w-1/2">
                        Start Date
                    </Text>
                    <Text className="text-md font-semibold text-red-500 w-1/2">
                        {event.startDate.toString()}
                    </Text>
                </Group>
                <Group>
                    <Text className="text-md font-semibold text-palette5">
                        Duration (days)
                    </Text>
                    <Text className="text-md font-semibold text-green-400">
                        {event.eventType === "activity"
                            ? event.duration !== null
                                ? event.duration
                                : "-"
                            : "-"}
                    </Text>
                </Group>
            </Group>
            {/* note */}
            <Stack>
                <Fieldset legend="Note" className="border-gray-400 rounded-xl">
                    <Text className="text-gray-600">
                        {event.note || "No note attached"}{" "}
                    </Text>
                </Fieldset>
            </Stack>
            {/* tags */}
            <Stack gap="sm" className="py-4">
                <Text>Tags</Text>
                <Group>
                    {event.tags.length > 0 ? (
                        <Group>
                            {event.tags.map((tag: Tag) => (
                                <Badge key={tag.id}>{tag.name}</Badge>
                            ))}
                        </Group>
                    ) : (
                        <Text className="text-gray-300">No tags assigned</Text>
                    )}
                </Group>
            </Stack>
        </Stack>
    );
}

function EventDetailsRight({ event }: { event: Event }) {
    return (
        <Stack className="h-full">
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
        if (event) {
            setFormInitialValues({
                name: event.name,
                startDate: event.startDate,
                duration: event.duration,
                note: event.note,
                status: event.status,
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
            {event && (
                <>
                    <SplitModal.Left title={`${event.name}`}>
                        <EventDetailsLeft event={event} />
                    </SplitModal.Left>
                    <SplitModal.Right>
                        <EventDetailsRight event={event} />
                    </SplitModal.Right>
                </>
            )}
        </SplitModal>
    );
}
