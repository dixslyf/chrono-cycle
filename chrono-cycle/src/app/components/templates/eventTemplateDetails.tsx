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
import { Calendar, Clock, X } from "lucide-react";

import { formatReminderTemplateTime } from "@/app/utils/dates";

import { EventTemplate, ReminderTemplate, Tag } from "@/common/data/domain";

interface DisplayEventDetailsProps {
    eventTemplate: EventTemplate;
    onClose: () => void;
}

function EventTemplateDetails({
    eventTemplate,
    onClose,
}: DisplayEventDetailsProps) {
    return (
        <Group className="w-full h-full gap-0 items-stretch">
            {/* left panel */}
            <Stack className="w-3/5 py-8 px-12 h-full overflow-y-auto" gap="xl">
                <Text className="text-3xl font-bold h-1/8">
                    {eventTemplate.name}
                </Text>
                <Stack>
                    <Text className="text-palette5 font-semibold text-xl">
                        Note:
                    </Text>
                    <Text className="h-2/5 border border-gray-400 rounded-xl p-4">
                        {eventTemplate.note || "No note attached"}
                    </Text>
                </Stack>
                <Fieldset legend="Reminders" className="border-gray-400">
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
                            <Text>No reminders set</Text>
                        )}
                    </SimpleGrid>
                </Fieldset>
            </Stack>

            {/* right panel */}
            <Stack className="py-8 px-4 w-2/5 items-stretch bg-palette1">
                <Group justify="space-between">
                    <Group>
                        <Text className="font-semibold text-xl text-palette3">
                            Event ID
                        </Text>
                        <Badge className="bg-stone-500 bg-opacity-50 text-gray-300">
                            {eventTemplate.id}
                        </Badge>
                    </Group>
                    <X
                        className="text-palette3 hover:text-gray-400 cursor-pointer w-8 h-8"
                        onClick={onClose}
                    />
                </Group>
                <SimpleGrid cols={2}>
                    <Group justify="space-between" className="p-4">
                        <Text className="text-md font-semibold text-palette3">
                            Offset Days
                        </Text>
                        <Text className="text-md font-semibold text-red-500">
                            {eventTemplate.offsetDays}
                        </Text>
                    </Group>
                    <Group justify="space-between" className="p-4">
                        <Text className="text-md font-semibold text-palette3">
                            Automatic Reschedule
                        </Text>
                        <Checkbox
                            checked={eventTemplate.autoReschedule}
                            readOnly
                        />
                    </Group>
                    <Group justify="space-between" className="p-4">
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
                    <Group justify="space-between" className="p-4">
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
                <Stack gap="sm" className="p-4">
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
        </Group>
    );
}

export default EventTemplateDetails;
