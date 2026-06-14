import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@travel-planner/core"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "upload.wikimedia.org", pathname: "/**" },
      { protocol: "https", hostname: "commons.wikimedia.org", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
    ],
  },
  async redirects() {
    return [
      { source: "/trip/:id/itinerary", destination: "/trip/:id/day/0", permanent: true },
      { source: "/trip/:id/itinerary/day/:dayIndex", destination: "/trip/:id/day/:dayIndex", permanent: true },
      { source: "/trip/:id/itinerary/map", destination: "/trip/:id/map", permanent: true },
      { source: "/trip/:id/itinerary/place/:placeId", destination: "/trip/:id/place/:placeId", permanent: true },
    ];
  },
};

export default nextConfig;
