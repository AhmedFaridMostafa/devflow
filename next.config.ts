import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pino", "pino-pretty", "mongoose"],
  images: {
    qualities: [25, 50, 75, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "static.vecteezy.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "jsearch.p.rapidapi.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "ip-api.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "restcountries.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "flagsapi.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "encrypted-tbn0.gstatic.com",
        port: "",
      },
    ],
  },
  cacheComponents: true,
};

export default nextConfig;
