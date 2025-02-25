// template page
import TemplateList from "@/app/components/templates/templateList";
import { listProjectTemplates } from "@/server/project-templates/list/action";

export default async function Templates() {
    const result = await listProjectTemplates();
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
                    {/* Error message when fetching the entries fail */}
                    {!result.success && <div>{result.errorMessage}</div>}
                    <TemplateList entries={result.projectTemplates || []} />
                </div>
            </section>
        </>
    );
}
