import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@travel-planner/core"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
