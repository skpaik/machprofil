import type { NextConfig } from "next";
const isProd = process.env.NODE_ENV === 'production';
const repoName = 'machprofil'; // your GitHub repo name

const nextConfig: NextConfig = {
    /* config options here */
    output: 'export',          // Enables `next export` static HTML
    basePath: isProd ? `/${repoName}` : '',
    assetPrefix: isProd ? `/${repoName}/` : '',
};

export default nextConfig;