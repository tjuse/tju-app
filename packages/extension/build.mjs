/**
 * esbuild bundler for the MV3 extension.
 *
 * Bundles three entry points into dist/:
 *   background.js — service worker (no DOM globals)
 *   content.js    — content script (DOM + chrome.* available)
 *   popup.js      — popup page script (DOM + chrome.* available)
 *
 * The workspace dependency @tju-app/eams-parsers is bundled in (no npm at
 * runtime in an extension context).
 */

import { argv } from "node:process";
import * as esbuild from "esbuild";

const watch = argv.includes("--watch");

const sharedConfig = {
  bundle: true,
  platform: "browser",
  target: "es2022",
  format: "esm",
  sourcemap: false,
  minify: false,
  external: [],
};

const entryPoints = [
  { in: "src/background/index.ts", out: "background" },
  { in: "src/content/index.ts", out: "content" },
  { in: "src/popup/index.ts", out: "popup" },
];

if (watch) {
  const ctx = await esbuild.context({
    ...sharedConfig,
    entryPoints,
    outdir: "dist",
  });
  await ctx.watch();
  console.log("Watching for changes…");
} else {
  const result = await esbuild.build({
    ...sharedConfig,
    entryPoints,
    outdir: "dist",
    metafile: true,
  });
  if (result.errors.length > 0) {
    process.exit(1);
  }
  console.log("Build complete →", Object.keys(result.metafile?.outputs ?? {}).join(", "));
}
