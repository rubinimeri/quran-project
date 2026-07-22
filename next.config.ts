import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `@napi-rs/canvas` ships a native `.node` addon; keep it out of the bundle so
  // Next loads it at runtime instead of trying to trace/bundle the binary.
  serverExternalPackages: ["@napi-rs/canvas"],
};

export default nextConfig;
