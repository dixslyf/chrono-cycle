import { wrapAuthRedirectLogin } from "@/app/components/auth/redirectWrapper";
import Navbar from "@/app/components/nav/navbar";

async function WorkspaceLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <div className="min-h-screen flex flex-col">
                <header className="flex-none">
                    <Navbar />
                </header>
                <main className="flex-1 w-full flex flex-col">{children}</main>
            </div>
        </>
    );
}

export default wrapAuthRedirectLogin(WorkspaceLayout);
