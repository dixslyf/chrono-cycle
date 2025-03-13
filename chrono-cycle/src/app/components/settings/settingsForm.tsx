"use client";

import {
    Button,
    Group,
    NativeSelect,
    SimpleGrid,
    Stack,
    Switch,
    Text,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import * as E from "fp-ts/Either";
import { startTransition, useActionState, useEffect } from "react";
import { match } from "ts-pattern";

import { UserSettings } from "@/common/data/userSession";

import { updateSettingsAction } from "@/features/settings/update/action";
import { payloadSchema, Result } from "@/features/settings/update/data";

function getUpdateStatusMessage(formStatus: Result): string {
    return match(formStatus)
        .with(
            { left: { _errorKind: "ValidationError" } },
            () => "Invalid or missing fields",
        )
        .with(
            { left: { _errorKind: "InternalError" } },
            () => "An internal error occurred",
        )
        .with(
            { left: { _errorKind: "DoesNotExistError" } },
            () => "Failed to retrieve user settings",
        )
        .with({ _tag: "Right" }, () => "Settings updated successfully!")
        .exhaustive();
}

function SettingsForm({ initialSettings }: { initialSettings: UserSettings }) {
    const [formStatus, submitAction, isSubmitting] = useActionState(
        updateSettingsAction,
        null,
    );

    const form = useForm({
        mode: "controlled",
        initialValues: initialSettings,
        validate: zodResolver(payloadSchema),
    });

    const { resetDirty: resetDirty } = form;
    useEffect(() => {
        if (!formStatus) {
            return;
        }

        // Reset the dirty state of the form on success.
        if (E.isRight(formStatus)) {
            resetDirty();
        }
    }, [formStatus, resetDirty]);

    return (
        <form
            onSubmit={form.onSubmit((values) =>
                startTransition(() => submitAction(values)),
            )}
        >
            <Stack gap="md" align="stretch" className="pb-8">
                <Text className="text-3xl font-bold">General</Text>
                <Text className="text-gray-400 font-semibold mb-2">
                    Manage General Settings
                </Text>

                <SimpleGrid cols={3}>
                    <Group justify="space-between">
                        <Text className="text-xl font-semibold">
                            Start Day of Week:
                        </Text>
                        <NativeSelect
                            data={["Monday", "Sunday"]}
                            {...form.getInputProps("startDayOfWeek")}
                        />
                    </Group>
                    <div /> {/* center column left empty */}
                    <Group justify="space-between">
                        <Text className="text-xl font-semibold">
                            Date Format:
                        </Text>
                        <NativeSelect
                            data={["MM/DD/YYYY", "DD/MM/YYYY", "YYYY/MM/DD"]}
                            {...form.getInputProps("dateFormat")}
                        />
                    </Group>
                </SimpleGrid>
                <hr />
            </Stack>

            <Stack>
                <Text className="text-3xl font-bold">Notifications</Text>
                <Text className="text-gray-400 font-semibold mb-2">
                    Update Your Notification Perferences
                </Text>

                <SimpleGrid cols={3}>
                    <Group justify="space-between">
                        <Text className="text-xl font-semibold">
                            Email Notifications:
                        </Text>
                        <Switch
                            size="md"
                            {...form.getInputProps("enableEmailNotifications", {
                                type: "checkbox",
                            })}
                        />
                    </Group>
                    <div /> {/* center column left */}
                    <Group justify="space-between">
                        <Text className="text-xl font-semibold">
                            Desktop Notifications:
                        </Text>
                        <Switch
                            size="md"
                            {...form.getInputProps(
                                "enableDesktopNotifications",
                                {
                                    type: "checkbox",
                                },
                            )}
                        />
                    </Group>
                </SimpleGrid>
                <hr />
            </Stack>

            <Stack gap="md" className="mt-2 items-center">
                {formStatus && (
                    <Text
                        className={`font-semibold text-xl ${E.isRight(formStatus) ? "text-green-500" : "text-red-500"}`}
                    >
                        {getUpdateStatusMessage(formStatus)}
                    </Text>
                )}
                <Group className="w-full" justify="flex-end">
                    <Button
                        type="submit"
                        disabled={!form.isDirty()}
                        loading={isSubmitting}
                        className={`transition-colors duration-200 ease-linear ${
                            !form.isDirty() || isSubmitting
                                ? "bg-gray-400 cursor-default text-palette3"
                                : "bg-palette2 hover:bg-palette1"
                        }`}
                    >
                        Save Changes
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}

export default SettingsForm;
