import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "luminique.b-cdn.net",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
