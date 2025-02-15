import Navbar from "@/app/components/nav/navbar";

export default function WorkspaceLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <header>
                <Navbar />
            </header>
            <main className="m-0 w-full h-full">{children}</main>
        </>
    );
}
