import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
const repoName = process.env.REPO_NAME || "";

const nextConfig: NextConfig = {
    /* config options here */
    output: "export",
    distDir: "out",
    basePath: isProd && repoName ? `/${repoName}` : "",
    assetPrefix: isProd && repoName ? `/${repoName}/` : "",
    images: {
        unoptimized: true,
    },
    trailingSlash: true,
};

export default nextConfig;
