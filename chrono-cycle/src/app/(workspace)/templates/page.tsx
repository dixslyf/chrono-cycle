// template page

import { Group, Stack, Text } from "@mantine/core";

import { CreateProjectTemplateButton } from "@/app/components/templates/createProjectTemplateButton";
import { ProjectTemplatesTable } from "@/app/components/templates/projectTemplatesTable";

export default async function Templates() {
    return (
        <>
            {/* header section */}
            <Text className="text-4xl font-bold p-4">Manage Template</Text>

            {/* create template section */}
            <Stack className="w-full pl-12 px-4 flex-1">
                <Group justify="flex-end">
                    <CreateProjectTemplateButton />
                </Group>
                <ProjectTemplatesTable />
            </Stack>
        </>
    );
}
