import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactCompiler: true,
  transpilePackages: ["mapbox-gl"],
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
