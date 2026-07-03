import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // prompts/*.txt are read with fs at runtime (extract.ts) — trace them into
  // the serverless bundle or they 404 on Vercel.
  outputFileTracingIncludes: {
    "/**": ["./prompts/**"],
  },
};

export default nextConfig;
