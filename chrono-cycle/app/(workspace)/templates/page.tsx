// template page

import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";

import TemplateList from "@/app/components/templates/templateList";
import { listProjectTemplatesAction } from "@/server/project-templates/list/action";
import { ProjectTemplateOverview } from "@/server/common/data";

export default async function Templates() {
    const result = await listProjectTemplatesAction();
    return (
        <>
            {/* <h1>This is the template page</h1> */}
            {/* header section */}
            <section>
                <h1>Manage Templates</h1>
            </section>

            {/* create template section */}
            <section className="w-full flex justify-center">
                <div className="w-5/6">
                    <TemplateList
                        entries={pipe(
                            result,
                            E.getOrElse((_) => [] as ProjectTemplateOverview[]),
                        )}
                    />
                </div>
            </section>
        </>
    );
}
