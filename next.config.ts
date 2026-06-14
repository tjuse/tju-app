import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // Bundle public course cache files into the serverless function so they are
  // readable via fs.readFile(process.cwd()/data/cache/...) on Vercel.
  // @vercel/nft cannot auto-trace files read at runtime via a dynamic path, so
  // we list them explicitly here.
  outputFileTracingIncludes: {
    "/**": ["./data/cache/courses-*.json", "./data/cache/syllabus-*.json"],
  },
};

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  // Disable service worker in development to avoid cache interference.
  disable: process.env.NODE_ENV === "development",
});

export default withSerwist(nextConfig);
