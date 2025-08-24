import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exclude exampletma folder from build
  webpack: (config) => {
    config.watchOptions = {
      ignored: ['**/exampletma/**']
    };
    return config;
  },
};

export default nextConfig;
