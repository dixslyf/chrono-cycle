"use client";

import {
    Badge,
    Checkbox,
    Fieldset,
    Group,
    SimpleGrid,
    Stack,
    Text,
} from "@mantine/core";
import { Calendar, Clock } from "lucide-react";

import { formatReminderTemplateTime } from "@/app/utils/dates";

import { EventTemplate, ReminderTemplate, Tag } from "@/common/data/domain";

import { DeleteEventTemplateButton } from "./deleteEventTemplateButton";

interface DisplayEventDetailsProps {
    eventTemplate: EventTemplate;
    onClose: () => void;
}

export function EventTemplateDetailsLeft({
    eventTemplate,
}: DisplayEventDetailsProps) {
    return (
        <Stack className="w-full h-full">
            <Text className="text-3xl font-bold">{eventTemplate.name}</Text>
            {/* notes */}
            <Stack>
                <Fieldset legend="Note" className="border-gray-400 rounded-xl">
                    <Text className="text-gray-600">
                        {eventTemplate.note || "No note attached"}
                    </Text>
                </Fieldset>
            </Stack>
            <Fieldset
                legend="Reminders"
                className="border-gray-400 rounded-xl flex-1"
            >
                <SimpleGrid cols={2} className="w-full">
                    {eventTemplate.reminders.length > 0 ? (
                        eventTemplate.reminders.map(
                            (reminder: ReminderTemplate, _index) => (
                                <Stack
                                    key={reminder.id}
                                    className="border border-gray-400 rounded-lg p-4"
                                    justify="center"
                                >
                                    <Group gap="xl">
                                        <Group gap="md">
                                            <Calendar className="w-8 h-8" />
                                            <Text>Days before event:</Text>
                                        </Group>
                                        <Text>
                                            {reminder.daysBeforeEvent}{" "}
                                            {reminder.daysBeforeEvent === 1
                                                ? "day"
                                                : "days"}
                                        </Text>
                                    </Group>
                                    <Group gap="xl">
                                        <Group gap="md">
                                            <Clock className="w-8 h-8" />
                                            <Text>Trigger time:</Text>
                                        </Group>
                                        <Text>
                                            {formatReminderTemplateTime(
                                                reminder.time,
                                            )}
                                        </Text>
                                    </Group>
                                    <Group>
                                        <Checkbox
                                            checked={
                                                reminder.emailNotifications
                                            }
                                            readOnly
                                            label="Email notification"
                                        />
                                        <Checkbox
                                            checked={
                                                reminder.desktopNotifications
                                            }
                                            readOnly
                                            label="Desktop notification"
                                        />
                                    </Group>
                                </Stack>
                            ),
                        )
                    ) : (
                        <Text className="text-gray-600">No reminders set</Text>
                    )}
                </SimpleGrid>
            </Fieldset>
        </Stack>
    );
}

export function EventTemplateDetailsRight({
    eventTemplate,
    onClose,
}: DisplayEventDetailsProps) {
    return (
        <Stack className="h-full" justify="space-between">
            <Stack>
                <Group justify="space-between" className="pb-4">
                    <Group>
                        <Text className="font-semibold text-xl text-palette3">
                            Event ID
                        </Text>
                        <Badge className="bg-stone-500 bg-opacity-50 text-gray-300">
                            {eventTemplate.id}
                        </Badge>
                    </Group>
                </Group>
                <SimpleGrid cols={2}>
                    <Group justify="space-between" className="py-4">
                        <Text className="text-md font-semibold text-palette3">
                            Offset Days
                        </Text>
                        <Text className="text-md font-semibold text-red-500">
                            {eventTemplate.offsetDays}
                        </Text>
                    </Group>
                    <Group justify="space-between" className="py-4">
                        <Text className="text-md font-semibold text-palette3">
                            Automatic Reschedule
                        </Text>
                        <Checkbox
                            checked={eventTemplate.autoReschedule}
                            readOnly
                        />
                    </Group>
                    <Group justify="space-between" className="py-4">
                        <Text className="text-md font-semibold text-palette3">
                            Event Type
                        </Text>
                        <Text
                            className={`text-md font-semibold ${
                                eventTemplate.eventType === "task"
                                    ? "text-fuchsia-500"
                                    : "text-blue-400"
                            }`}
                        >
                            {eventTemplate.eventType === "task"
                                ? "Task"
                                : "Activity"}
                        </Text>
                    </Group>
                    <Group justify="space-between" className="py-4">
                        <Text className="text-md font-semibold text-palette3">
                            Duration (days)
                        </Text>
                        <Text className="text-md font-semibold text-green-400">
                            {eventTemplate.eventType === "activity"
                                ? eventTemplate.duration !== null
                                    ? eventTemplate.duration
                                    : "-"
                                : "-"}
                        </Text>
                    </Group>
                </SimpleGrid>
                <Stack gap="sm" className="py-4">
                    <Text className="text-md font-semibold text-palette3">
                        Tags
                    </Text>
                    <Group>
                        {eventTemplate.tags.length > 0 ? (
                            <Group>
                                {eventTemplate.tags.map((tag: Tag) => (
                                    <Badge
                                        key={tag.id}
                                        className="bg-stone-500 bg-opacity-50 text-gray-300"
                                    >
                                        {tag.name}
                                    </Badge>
                                ))}
                            </Group>
                        ) : (
                            <Text className="text-gray-300">
                                No tags assigned
                            </Text>
                        )}
                    </Group>
                </Stack>
            </Stack>
            <Group justify="flex-end">
                <DeleteEventTemplateButton
                    eventTemplateId={eventTemplate.id}
                    onSuccess={onClose}
                />
            </Group>
        </Stack>
    );
}
