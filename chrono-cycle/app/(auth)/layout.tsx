import { wrapAuthRedirectDashboard } from "@/app/components/auth/redirectWrapper";

async function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <main className="m-0 w-full h-full">{children}</main>;
}

export default wrapAuthRedirectDashboard(AuthLayout);
