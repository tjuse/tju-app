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
 * available. Returns false on Vercel or when TJU_LIVE=0 is set for local
 * testing of demo mode.
 */
export function isLiveFetchAvailable(): boolean {
  return !process.env.VERCEL && process.env.TJU_LIVE !== "0";
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
