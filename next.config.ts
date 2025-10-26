import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const repoName = 'machprofil';

const nextConfig: NextConfig = {
    /* config options here */
    output: 'export',
    distDir: "docs",
    basePath: '/machprofil',
    assetPrefix: '/machprofil/',
    images: {
        unoptimized: true,
    },
    trailingSlash: true,
};

export default nextConfig;
