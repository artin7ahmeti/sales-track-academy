import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@salestrack/contracts'],
};

export default nextConfig;
