// template page

import { Group, Stack } from "@mantine/core";

import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

import { listProjectTemplatesAction } from "@/server/project-templates/list/action";
import { ProjectTemplateOverview } from "@/server/common/data";

import { CreateProjectTemplateButton } from "@/app/components/templates/createTemplateButton";
import { TemplateTable } from "@/app/components/templates/templateTable";

export default async function Templates() {
    const listProjectTemplatesResult = await listProjectTemplatesAction();
    const entries = pipe(
        listProjectTemplatesResult,
        E.getOrElse(() => [] as ProjectTemplateOverview[]),
    );

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
                    <TemplateTable entries={entries} />
                    <Group justify="flex-end">
                        <CreateProjectTemplateButton />
                    </Group>
                </Stack>
            </section>
        </>
    );
}
