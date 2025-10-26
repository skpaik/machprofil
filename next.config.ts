import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';
const repoName = 'machprofil';

const nextConfig: NextConfig = {
    /* config options here */
    output: 'export',
    distDir: "out",
    images: {
        unoptimized: true,
    },
    basePath: isProd ? `/${repoName}` : '',
    assetPrefix: isProd ? `/${repoName}/` : '',
};

export default nextConfig;