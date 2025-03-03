import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    serverExternalPackages: ["@electric-sql/pglite", "pino", "pino-pretty"],
};

export default nextConfig;
