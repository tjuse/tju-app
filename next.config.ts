import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The personal-data pages import runtime values + types from the workspace
  // parser package (raw TS source), so Next must transpile it.
  transpilePackages: ["@tju-app/eams-parsers"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // eams-parsers uses NodeNext-style ".js" import specifiers that point at ".ts"
  // source files. Webpack needs to be told to resolve ".js" → ".ts".
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
      ".mjs": [".mts", ".mjs"],
    };
    return config;
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
