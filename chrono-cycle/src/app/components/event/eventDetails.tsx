"use client";

import {
    Badge,
    Checkbox,
    Fieldset,
    Group,
    ScrollArea,
    Stack,
    Text,
} from "@mantine/core";
import { Clock } from "lucide-react";
import React from "react";

import { theme } from "@/app/provider";

import { Event, Reminder, Tag } from "@/common/data/domain";

interface DisplayEventDetailsProps {
    event: Event;
}

export function DisplayEventDetailsLeft({
    event,
}: {
    event: Event;
}): React.ReactNode {
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

export function DisplayEventDetailsRight({ event }: DisplayEventDetailsProps) {
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
