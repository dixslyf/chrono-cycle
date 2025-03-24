// template page

import { Group, Stack } from "@mantine/core";

import { CreateProjectTemplateButton } from "@/app/components/templates/createProjectTemplateButton";
import { ImportProjectTemplateButton } from "@/app/components/templates/importProjectTemplateButton";
import { ProjectTemplatesTable } from "@/app/components/templates/projectTemplatesTable";

export default async function Templates() {
    return (
        <>
            {/* <h1>This is the template page</h1> */}
            {/* header section */}
            <section>
                <h1>Manage Templates</h1>
            </section>

            {/* create template section */}
            <section className="w-full flex justify-center">
                <Stack>
                    <ProjectTemplatesTable />
                    <Group justify="flex-end">
                        <ImportProjectTemplateButton />
                        <CreateProjectTemplateButton />
                    </Group>
                </Stack>
            </section>
        </>
    );
}
