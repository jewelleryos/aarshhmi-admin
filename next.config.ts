// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
//   reactStrictMode: false,
//   images: {
//     remotePatterns: [
//       {
//         protocol: "https",
//         hostname: "aarshhmi-dev.b-cdn.net",
//         pathname: "/**",
//       },
//       {
//         protocol: "https",
//         hostname: "aarshhmi-live.b-cdn.net",
//         pathname: "/**",
//       },
//     ],
//   },
// };

// export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`,
      },
    ]
  },
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

