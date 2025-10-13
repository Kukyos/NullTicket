import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Pin the build root so Turbopack ignores other lockfiles on the machine
    root: __dirname,
  },
};

export default nextConfig;
