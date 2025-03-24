// template page

import { Group, Stack, Text } from "@mantine/core";

import { CreateProjectTemplateButton } from "@/app/components/templates/createProjectTemplateButton";
import { ProjectTemplatesTable } from "@/app/components/templates/projectTemplatesTable";

export default async function Templates() {
    return (
        <>
            {/* <h1>This is the template page</h1> */}
            {/* header section */}
            <Text className="text-4xl font-bold p-4">Manage Template</Text>

            {/* create template section */}
            <Stack className="w-full pl-12 px-4 flex-1">
                <ProjectTemplatesTable />
                <Group justify="flex-end">
                    <CreateProjectTemplateButton />
                </Group>
            </Stack>
        </>
    );
}
