/**
 * Runtime environment detection.
 *
 * "Live fetch" means spawning Python over the TJU campus network to retrieve
 * real-time data from EAMS. This is unavailable on Vercel (no Python runtime,
 * no campus-network access). All routes and stores that call `runTju()` must
 * check `isLiveFetchAvailable()` before spawning, and return a demo-mode error
 * when it returns false.
 */

/**
 * Whether real-time TJU data fetching (spawning Python via tju_cli.py) is
 * available — i.e. we are running in local development with a Python venv.
 *
 * IMPORTANT: platform vars like `NETLIFY` / `VERCEL` are only set at *build*
 * time, not inside the serverless function runtime, so checking them at request
 * time wrongly returned true on deployed sites and tried to spawn Python
 * (`spawn .venv/bin/python ENOENT`). We instead key off NODE_ENV, which is
 * "production" for any deployed build and "development" only under `next dev`.
 *
 *   TJU_LIVE=1 → force on   (e.g. `pnpm start` locally with a venv)
 *   TJU_LIVE=0 → force off
 *   otherwise  → on only in local development
 */
export function isLiveFetchAvailable(): boolean {
  if (process.env.TJU_LIVE === "1") return true;
  if (process.env.TJU_LIVE === "0") return false;
  return process.env.NODE_ENV !== "production";
}

/** True when running in read-only demo mode (no live campus network). */
export function isDemoMode(): boolean {
  return !isLiveFetchAvailable();
}

/**
 * The user-facing message shown when a live-fetch action is attempted in demo
 * mode. Keep it in Chinese since this is a TJU app.
 */
export const DEMO_MODE_MESSAGE = "实时刷新仅在本地/校园网环境可用（演示环境为只读数据）";
