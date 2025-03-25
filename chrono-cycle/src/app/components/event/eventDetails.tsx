"use client";

import {
    Badge,
    Checkbox,
    Divider,
    Group,
    Paper,
    Stack,
    Text,
} from "@mantine/core";
import { Clock } from "lucide-react";

import { Event, Reminder, Tag } from "@/common/data/domain";

interface DisplayEventDetailsProps {
    event: Event;
}

function DisplayEventDetails({ event }: DisplayEventDetailsProps) {
    return (
        <Paper p="md" radius="md" withBorder>
            {/* Basic Information Section */}
            <Stack gap="md">
                <Text fw={700} size="lg">
                    Basic Information
                </Text>

                <Group justify="apart">
                    <Stack gap="xs" style={{ flex: 1 }}>
                        <Text fw={500}>Name</Text>
                        <Text>{event.name}</Text>
                    </Stack>

                    <Stack gap="xs" style={{ flex: 1 }}>
                        <Text fw={500}>Start date</Text>
                        <Text>{event.startDate.toString()}</Text>
                    </Stack>
                </Group>

                <Group justify="apart">
                    <Stack gap="xs" style={{ flex: 1 }}>
                        <Text fw={500}>Event type</Text>
                        <Text>
                            {event.eventType === "task" ? "Task" : "Activity"}
                        </Text>
                    </Stack>

                    <Stack gap="xs" style={{ flex: 1 }}>
                        <Text fw={500}>Duration (days)</Text>
                        <Text>{event.duration}</Text>
                    </Stack>
                </Group>

                <Stack gap="xs">
                    <Text fw={500}>Auto Reschedule</Text>
                    <Checkbox
                        checked={event.autoReschedule}
                        readOnly
                        label="Automatically reschedule the event when a dependency event is delayed"
                    />
                </Stack>
            </Stack>

            <Divider my="md" />

            {/* Reminders Section */}
            <Stack gap="md">
                <Text fw={700} size="lg">
                    Reminders
                </Text>

                {event.reminders.length > 0 ? (
                    event.reminders.map((reminder: Reminder, _index) => (
                        <Paper key={reminder.id} p="sm" withBorder>
                            <Stack gap="xs">
                                <Group justify="apart">
                                    <Stack gap={0}>
                                        <Group gap="xs">
                                            <Clock size={16} />
                                            <Text fw={500}>Trigger time</Text>
                                        </Group>
                                        <Text>
                                            {reminder.triggerTime.toString()}
                                        </Text>
                                    </Stack>
                                </Group>

                                <Group mt="xs">
                                    <Checkbox
                                        checked={reminder.emailNotifications}
                                        readOnly
                                        label="Email notification"
                                    />
                                    <Checkbox
                                        checked={reminder.desktopNotifications}
                                        readOnly
                                        label="Desktop notification"
                                    />
                                </Group>
                            </Stack>
                        </Paper>
                    ))
                ) : (
                    <Text c="dimmed" style={{ fontStyle: "italic" }}>
                        No reminders set
                    </Text>
                )}
            </Stack>

            <Divider my="md" />

            {/* Miscellaneous Section */}
            <Stack gap="md">
                <Text fw={700} size="lg">
                    Miscellaneous
                </Text>

                <Stack gap="xs">
                    <Text fw={500}>Note</Text>
                    <Text>{event.note || "No notes attached"}</Text>
                </Stack>

                <Stack gap="xs">
                    <Text fw={500}>Tags</Text>
                    {event.tags.length > 0 ? (
                        <Group gap="xs">
                            {event.tags.map((tag: Tag) => (
                                <Badge key={tag.id}>{tag.name}</Badge>
                            ))}
                        </Group>
                    ) : (
                        <Text c="dimmed" style={{ fontStyle: "italic" }}>
                            No tags assigned
                        </Text>
                    )}
                </Stack>

                <Group justify="apart">
                    <Stack gap="xs">
                        <Text fw={500}>Status</Text>
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
                    </Stack>

                    <Stack gap="xs">
                        <Text fw={500}>Last Updated</Text>
                        <Text>{event.updatedAt.toLocaleDateString()}</Text>
                    </Stack>
                </Group>
            </Stack>
        </Paper>
    );
}

export default DisplayEventDetails;
