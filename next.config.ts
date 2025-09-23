import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  register: false, // Keep manual registration for better control
  reloadOnOnline: true,
  additionalPrecacheEntries: [
    // Ensure main pages are precached
    { url: "/", revision: "1" },
    { url: "/currency", revision: "1" },
    { url: "/crypto", revision: "1" },
  ],
  exclude: [/\.map$/, /^manifest.*\.js$/],
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  trailingSlash: false,

  // Optimize webpack for better CSS handling
  webpack: (config, { dev, isServer }) => {
    // In production, optimize CSS chunking
    if (!dev && !isServer) {
      config.optimization.splitChunks.cacheGroups.styles = {
        name: 'styles',
        test: /\.(css|scss|sass)$/,
        chunks: 'all',
        enforce: true,
        priority: 10,
      };
    }

    return config;
  },
};

export default withSerwist(nextConfig);
