import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const repoName = 'machprofil';

const nextConfig: NextConfig = {
    /* config options here */
    output: 'export',
    distDir: "docs",
    basePath: isProd ? `/${repoName}` : '',
    assetPrefix: isProd ? `/${repoName}/` : '',
    images: {
        unoptimized: true,
    },
    trailingSlash: true,
};

export default nextConfig;
