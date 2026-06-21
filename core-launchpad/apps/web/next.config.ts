import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@core-launchpad/sdk"],
  webpack: (config: any) => {
    config.resolve.fallback = { ...config.resolve.fallback, fs: false, net: false, tls: false };
    return config;
  },
};

export default nextConfig;
