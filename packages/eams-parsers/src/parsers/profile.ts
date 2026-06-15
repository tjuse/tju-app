/**
 * HTML parser for the student personal-information (profile) page.
 * Ported from tju-python/src/tju/parser/profile.py
 */

import type { ProfileResult } from "../types.js";

/**
 * Parse the profile HTML and return a flat key→value object.
 *
 * The page renders a definition-list table where each row has a title cell
 * (with class="title") followed by a value cell.  The regex mirrors the Python
 * parse_profile function exactly.
 */
export function parseProfile(html: string): ProfileResult {
  const matches = html.matchAll(
    /<td[ width="25%"]* class="title" style="width:18%">([^<]+)<\/td>\s*<td[^>]*>([^<]*)<\/td>/g,
  );

  const result: ProfileResult = {};
  for (const m of matches) {
    let key = (m[1] ?? "").trim();
    const value = (m[2] ?? "").trim();
    // Strip trailing "：" from keys (matching Python: key.strip("："))
    if (key.endsWith("：")) key = key.slice(0, -1);
    result[key] = value;
  }

  return result;
}
