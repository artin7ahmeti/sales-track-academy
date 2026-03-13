import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@salestrack/contracts'],
};

export default nextConfig;
