import { Button } from "@mantine/core";
import FileSaver from "file-saver";

import { ProjectTemplate } from "@/common/data/domain";

import { Payload } from "@/features/project-templates/import/data";

export function ExportProjectTemplateButton({
    projectTemplate,
    disabled,
}: {
    projectTemplate?: ProjectTemplate | undefined;
    disabled?: boolean | undefined;
}) {
    return (
        <Button
            onClick={() => {
                if (projectTemplate) {
                    const output = {
                        name: projectTemplate.name,
                        description: projectTemplate.description,
                        events: projectTemplate.events.map((event) => ({
                            name: event.name,
                            offsetDays: event.offsetDays,
                            duration: event.duration,
                            note: event.note,
                            eventType: event.eventType,
                            autoReschedule: event.autoReschedule,
                            reminders: event.reminders.map((reminder) => ({
                                daysBeforeEvent: reminder.daysBeforeEvent,
                                time: reminder.time,
                                emailNotifications: reminder.emailNotifications,
                                desktopNotifications:
                                    reminder.desktopNotifications,
                            })),
                            tags: event.tags.map((tag) => tag.name),
                        })),
                    } satisfies Payload;
                    const json = JSON.stringify(output);
                    const blob = new Blob([json], { type: "application/json" });
                    FileSaver.saveAs(blob, `${projectTemplate.name}.json`);
                }
            }}
            disabled={disabled}
        >
            Export
        </Button>
    );
}
