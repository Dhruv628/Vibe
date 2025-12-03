/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Skip .d.ts files completely
    config.module.rules.push({
      test: /\.d\.ts$/,
      use: "null-loader",
    });

    return config;
  },
};

export default nextConfig;
