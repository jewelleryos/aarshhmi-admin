import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "aarshhmi-dev.b-cdn.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "aarshhmi-live.b-cdn.net",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
