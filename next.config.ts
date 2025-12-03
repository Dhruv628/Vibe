import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('@prisma/client');
    }
    return config;
  },
  outputFileTracingIncludes: {
    '/api/**/*': ['./src/generated/prisma/**/*'],
  },
};

export default nextConfig;
