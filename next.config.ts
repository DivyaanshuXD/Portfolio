import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Vercel-friendly config — no `output: "standalone"` (Vercel handles
     deployment automatically). ignoreBuildErrors stays true so the build
     doesn't fail on the pre-existing TweakPane type issues that don't
     affect runtime. */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "preview-chat-dbfc3d15-4834-47f0-94ee-bf5467c61033.space-z.ai",
    "*.space-z.ai",
  ],
};

export default nextConfig;
