import {
    ActionIcon,
    Button,
    Checkbox,
    Fieldset,
    Group,
    NumberInput,
    ScrollArea,
    Stack,
    Text,
    type CheckboxProps,
    type NumberInputProps,
} from "@mantine/core";
import { TimeInput, type TimeInputProps } from "@mantine/dates";
import { Calendar, Clock, Plus, Trash } from "lucide-react";

import { theme } from "@/app/provider";

import { Payload as ReminderCreate } from "@/features/reminder-templates/create/data";

export type RemindersInputEntry = Omit<
    ReminderCreate,
    "eventTemplateId" | "projectTemplateId" | "desktopNotifications"
>;

export function RemindersInput({
    entries,
    disabled,
    daysBeforeEventInputProps,
    triggerTimeInputProps,
    emailNotificationsInputProps,
    onReminderDelete,
    onReminderAdd,
}: {
    entries: RemindersInputEntry[];
    disabled?: boolean;
    daysBeforeEventInputProps?: (index: number) => NumberInputProps;
    triggerTimeInputProps?: (index: number) => TimeInputProps;
    emailNotificationsInputProps?: (index: number) => CheckboxProps;
    onReminderDelete?: (index: number) => void;
    onReminderAdd?: (defaultEntry: RemindersInputEntry) => void;
}) {
    const entryElements = entries.map((_reminder, index) => {
        const { key: rDaysBeforeEventInputKey, ...rDaysBeforeEventInputProps } =
            daysBeforeEventInputProps ? daysBeforeEventInputProps(index) : {};

        const { key: rTriggerTimeInputKey, ...rTriggerTimeInputProps } =
            triggerTimeInputProps ? triggerTimeInputProps(index) : {};

        const {
            key: rEmailNotificationsInputKey,
            ...rEmailNotificationsInputProps
        } = emailNotificationsInputProps
            ? emailNotificationsInputProps(index)
            : {};

        return (
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
                        key={rDaysBeforeEventInputKey}
                        label="Days before event"
                        leftSection={<Calendar />}
                        min={0}
                        disabled={disabled}
                        required
                        {...rDaysBeforeEventInputProps}
                    />
                    <TimeInput
                        key={rTriggerTimeInputKey}
                        label="Trigger time"
                        leftSection={<Clock />}
                        disabled={disabled}
                        required
                        {...rTriggerTimeInputProps}
                    />
                </Group>
                {/* notification */}
                <Group>
                    <Checkbox
                        key={rEmailNotificationsInputKey}
                        label="Email notification"
                        disabled={disabled}
                        {...rEmailNotificationsInputProps}
                    />
                    {/* delete button */}
                    <Group justify="flex-end" className="flex-grow">
                        <ActionIcon
                            color="red"
                            onClick={() =>
                                onReminderDelete
                                    ? onReminderDelete(index)
                                    : undefined
                            }
                        >
                            <Trash />
                        </ActionIcon>
                    </Group>
                </Group>
            </Stack>
        );
    });

    return (
        <Fieldset c="white" unstyled style={{ display: "flex" }}>
            <Stack gap="lg" w="100%">
                <ScrollArea style={{ root: { flex: 1 } }}>
                    <Stack gap="lg" style={{ flex: 1 }}>
                        {entries.length > 0 ? (
                            entryElements
                        ) : (
                            <Text c="white">No reminders set</Text>
                        )}
                    </Stack>
                </ScrollArea>
                <Group justify="flex-end">
                    <Button
                        leftSection={<Plus />}
                        onClick={() =>
                            onReminderAdd
                                ? onReminderAdd({
                                      daysBeforeEvent: 0,
                                      time: "09:00",
                                      emailNotifications: true,
                                  } satisfies RemindersInputEntry)
                                : undefined
                        }
                    >
                        Add Reminder
                    </Button>
                </Group>
            </Stack>
        </Fieldset>
    );
}
