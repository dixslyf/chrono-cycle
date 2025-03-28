// template page

import { Divider, Group, Space, Stack, Text, Title } from "@mantine/core";

import { CreateProjectTemplateButton } from "@/app/components/templates/createProjectTemplateButton";
import { ProjectTemplatesTable } from "@/app/components/templates/projectTemplatesTable";

export default async function Templates() {
    return (
        <Group justify="center" className="w-full">
            <Stack className="w-1/2" mt={24}>
                {/* header section */}
                <Title order={1} className="text-2xl font-bold" pl={12} pr={12}>
                    Manage Project Templates
                </Title>

                <Divider />
                <Space />

                <Stack pl={12} pr={12}>
                    <ProjectTemplatesTable />
                    <Group justify="flex-end">
                        <CreateProjectTemplateButton />
                    </Group>
                </Stack>
            </Stack>
        </Group>
    );
}
