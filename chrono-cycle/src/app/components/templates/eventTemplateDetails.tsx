"use client";

import {
    Box,
    Button,
    Group,
    NumberInput,
    Stack,
    TagsInput,
    Text,
    Textarea,
    useModalsStack,
} from "@mantine/core";
import { useForm, zodResolver, type UseFormReturnType } from "@mantine/form";
import {
    useMutation,
    UseMutationResult,
    useQueryClient,
} from "@tanstack/react-query";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { useEffect } from "react";

import { EditableTitle } from "@/app/components/customComponent/editableTitle";
import { SplitModal } from "@/app/components/customComponent/splitModal";
import { notifyError, notifySuccess } from "@/app/utils/notifications";
import { queryKeys } from "@/app/utils/queries/keys";

import {
    EventTemplate,
    ReminderTemplate,
    tagNameSchema,
} from "@/common/data/domain";

import { updateEventTemplateAction } from "@/features/event-templates/update/action";
import {
    Failure,
    payloadSchema,
    Payload as UpdatePayload,
} from "@/features/event-templates/update/data";

import { DeleteEventTemplateButton } from "./deleteEventTemplateButton";
import {
    ReminderTemplatesInput,
    ReminderTemplatesInputEntry,
} from "./reminderTemplatesInput";

// Removing auto-scheduling because we don't have time to implement it.
type UpdateFormValues = Required<
    Omit<
        UpdatePayload,
        | "id"
        | "autoReschedule"
        | "remindersDelete"
        | "remindersUpdate"
        | "remindersInsert"
    >
> & {
    reminders: (ReminderTemplatesInputEntry & Partial<ReminderTemplate>)[];
};

interface EventTemplateDetailsLeftProps {
    eventTemplate: EventTemplate;
    updateMutation: UseMutationResult<EventTemplate, Failure, UpdateFormValues>;
    updateForm: UseFormReturnType<UpdateFormValues>;
}

export function EventTemplateDetailsLeft({
    eventTemplate,
    updateMutation,
    updateForm,
}: EventTemplateDetailsLeftProps) {
    return (
        <Stack gap="xl" className="h-full">
            {/* Not editable because an event's type is not modifiable. */}
            <Text>
                <Text span fw={500}>
                    Event type:
                </Text>
                {eventTemplate.eventType === "task" ? " Task" : " Activity"}
            </Text>
            <Group grow>
                {/* offset days */}
                <NumberInput
                    size="md"
                    label="Offset days"
                    error="Invalid number of offset days"
                    disabled={updateMutation.isPending}
                    required
                    {...updateForm.getInputProps("offsetDays")}
                />
                {/* duration */}
                <NumberInput
                    size="md"
                    key={updateForm.key("duration")}
                    label="Duration (days)"
                    min={1}
                    error="Invalid duration"
                    disabled={
                        updateMutation.isPending ||
                        eventTemplate.eventType === "task"
                    }
                    required
                    {...updateForm.getInputProps("duration")}
                />
            </Group>
            {/* note */}
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
                disabled={updateMutation.isPending}
                {...updateForm.getInputProps("tags")}
                classNames={{ pill: "bg-gray-200" }}
            />
        </Stack>
    );
}

interface EventTemplateDetailsRightProps<T extends string> {
    eventTemplate: EventTemplate;
    modalStack: ReturnType<
        typeof useModalsStack<"confirm-delete-event-template" | T>
    >;
    updateMutation: UseMutationResult<EventTemplate, Failure, UpdateFormValues>;
    updateForm: UseFormReturnType<UpdateFormValues>;
    onClose: () => void;
}

export function EventTemplateDetailsRight<T extends string>({
    eventTemplate,
    modalStack,
    updateMutation,
    updateForm,
    onClose,
}: EventTemplateDetailsRightProps<T>) {
    return (
        <Stack className="h-full" justify="space-between">
            <ReminderTemplatesInput
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
                <DeleteEventTemplateButton
                    eventTemplateId={eventTemplate.id}
                    modalStack={modalStack}
                    onSuccess={onClose}
                />
                <Button
                    type="submit"
                    form="update-event-template-form"
                    loading={updateMutation.isPending}
                    disabled={!updateForm.isDirty()}
                >
                    Save
                </Button>
            </Group>
        </Stack>
    );
}

export function EventTemplateDetailsModal<T extends string>({
    modalStack,
    eventTemplate,
}: {
    modalStack: ReturnType<
        typeof useModalsStack<
            "event-template-details" | "confirm-delete-event-template" | T
        >
    >;
    eventTemplate?: EventTemplate;
}) {
    const updateForm = useForm<UpdateFormValues>({
        mode: "uncontrolled",
        initialValues: {
            name: eventTemplate?.name ?? "",
            offsetDays: eventTemplate?.offsetDays ?? 0,
            duration: eventTemplate?.duration ?? 0,
            note: eventTemplate?.note ?? "",
            // Note: This requires pre-processing before sending to the server.
            // Also, we re-use the reminder template's ID as the key.
            reminders:
                eventTemplate?.reminders.map((rt) => ({ key: rt.id, ...rt })) ??
                [],
            tags:
                eventTemplate?.tags.map((tag) => tag.name) ?? ([] as string[]),
        } satisfies UpdateFormValues,
        validate: {
            ...zodResolver(payloadSchema.omit({ id: true })),
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
        if (eventTemplate) {
            setFormInitialValues({
                name: eventTemplate.name,
                offsetDays: eventTemplate.offsetDays,
                duration: eventTemplate.duration,
                note: eventTemplate.note,
                reminders: eventTemplate.reminders.map((rt) => ({
                    key: rt.id,
                    ...rt,
                })),
                tags: eventTemplate.tags.map((tag) => tag.name),
            });
            resetForm();
        }
    }, [eventTemplate, setFormInitialValues, resetForm]);

    const queryClient = useQueryClient();
    const updateMutation = useMutation({
        mutationFn: async (values: UpdateFormValues) => {
            // Safety: If we've reached this point, eventTemplate should be defined.
            const et = eventTemplate as EventTemplate;

            const { reminders: newReminders, ...rest } = values;

            // The ones to insert are those without an ID.
            const remindersInsert = newReminders.filter(
                (rt) => rt.id === undefined,
            );

            // "Survivors" means those existing reminder templates that
            // have not been removed.
            const newRemindersSurvivors = newReminders.filter(
                (rt) => rt.id !== undefined,
            ) as ReminderTemplate[];

            // The ones to delete are those that are not in the survivors list.
            const newRemindersSurvivorIds = new Set(
                newRemindersSurvivors.map((rt) => rt.id),
            );
            const remindersDelete = et.reminders
                .map((rt) => rt.id)
                .filter((id) => !newRemindersSurvivorIds.has(id));

            // The ones that need to be updated are those in the survivors list
            // that are dirty.
            const etRtMap = new Map(
                et.reminders.map((rt) => [rt.id, rt] as const),
            );
            const remindersUpdate = newRemindersSurvivors.filter((rt) => {
                const etRt = etRtMap.get(rt.id) as ReminderTemplate;
                return (
                    rt.desktopNotifications !== etRt.desktopNotifications ||
                    rt.time !== etRt.time ||
                    rt.daysBeforeEvent !== etRt.daysBeforeEvent ||
                    rt.eventTemplateId !== etRt.eventTemplateId ||
                    rt.emailNotifications !== etRt.emailNotifications
                );
            });

            const result = await updateEventTemplateAction(null, {
                id: eventTemplate?.id as string,
                remindersInsert,
                remindersDelete,
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

            // Safety: Project template should already have loaded,
            // so its ID can be safely cast to string.
            queryClient.invalidateQueries({
                queryKey: queryKeys.projectTemplates.retrieve(
                    eventTemplate?.projectTemplateId as string,
                ),
            });

            updateForm.resetDirty();
        },
        onError: (_err: Failure) => {
            notifyError({ message: "Failed to update event template." });
        },
    });

    return (
        <SplitModal {...modalStack.register("event-template-details")}>
            <form
                id="update-event-template-form"
                onSubmit={updateForm.onSubmit((values) =>
                    updateMutation.mutate(values),
                )}
            />
            {eventTemplate ? (
                <>
                    <SplitModal.Left
                        title={eventTemplate?.name ?? ""}
                        titleComponent={() => (
                            <EditableTitle
                                key={updateForm.key("name")}
                                disabled={updateMutation.isPending}
                                {...updateForm.getInputProps("name")}
                            />
                        )}
                    >
                        <EventTemplateDetailsLeft
                            eventTemplate={eventTemplate}
                            updateForm={updateForm}
                            updateMutation={updateMutation}
                        />
                    </SplitModal.Left>
                    <SplitModal.Right title="Reminders">
                        <EventTemplateDetailsRight
                            eventTemplate={eventTemplate}
                            modalStack={modalStack}
                            updateMutation={updateMutation}
                            updateForm={updateForm}
                            onClose={() =>
                                modalStack.close("event-template-details")
                            }
                        />
                    </SplitModal.Right>
                </>
            ) : (
                <Box>Loading event details...</Box>
            )}
        </SplitModal>
    );
}
