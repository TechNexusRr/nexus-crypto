import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import { flightRouterStateSchema } from "next/dist/server/app-render/types";

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
  register: false,
  reloadOnOnline: false,
  // Additional Workbox options
  additionalPrecacheEntries: [],
  exclude: [/\.map$/, /^manifest.*\.js$/],
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default withSerwist(nextConfig);
