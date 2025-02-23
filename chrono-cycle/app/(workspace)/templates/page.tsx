// template page
import TemplateList from "@/app/components/templates/templateList";

export default function Template() {
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
                    <TemplateList />
                </div>
            </section>
        </>
    );
}
