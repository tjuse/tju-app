/**
 * Client-side bridge to the TJU App Browser Extension.
 *
 * The extension injects a content script that relays messages between the page
 * (window.postMessage) and the background service worker (chrome.runtime).
 *
 * This module is intentionally free of React — use it from client components
 * or hooks.  It runs in the browser only; never import it from server components.
 *
 * Handshake:  send a "tju:ping" message.  If a response arrives within 1 s the
 * extension is present and the session is reachable.
 */

import type { ExamEntry, GSScoreRecord, ScheduleEntry, UGScoreRecord } from "@tju-app/eams-parsers";

// ---------------------------------------------------------------------------
// Message types (duplicated from packages/extension/src/shared/messages.ts
// so the app doesn't need to import from the extension package at build time)
// ---------------------------------------------------------------------------

type RequestType = "tju:ping" | "tju:fetchSchedule" | "tju:fetchScore" | "tju:fetchExam";

interface ExtensionRequest {
  type: RequestType;
  requestId: string;
  [key: string]: unknown;
}

interface SuccessResponse<T> {
  requestId: string;
  ok: true;
  data: T;
}

interface ErrorResponse {
  requestId: string;
  ok: false;
  error: string;
}

type ExtensionResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

interface WindowMessage {
  source: "tju-extension";
  direction: "request" | "response";
  payload: ExtensionRequest | ExtensionResponse;
}

export type StudentType = "undergraduate" | "graduate";

/** Score result with the student type auto-detected by the extension. */
export interface ScoreResult {
  studentType: StudentType;
  records: UGScoreRecord[] | GSScoreRecord[];
}

// ---------------------------------------------------------------------------
// Core: post a request and await the matching response
// ---------------------------------------------------------------------------

let counter = 0;

function nextId(): string {
  return `tju-${Date.now()}-${++counter}`;
}

function sendRequest<T>(req: ExtensionRequest, timeoutMs = 8000): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      window.removeEventListener("message", handler);
      reject(new Error(`TJU extension request timed out (${req.type})`));
    }, timeoutMs);

    function handler(event: MessageEvent<unknown>): void {
      const msg = event.data as WindowMessage | undefined;
      if (msg?.source !== "tju-extension" || msg?.direction !== "response") return;

      const res = msg.payload as ExtensionResponse<T>;
      if (res.requestId !== req.requestId) return;

      clearTimeout(timer);
      window.removeEventListener("message", handler);

      if (res.ok) {
        resolve(res.data);
      } else {
        reject(new Error(res.error));
      }
    }

    window.addEventListener("message", handler);

    window.postMessage(
      {
        source: "tju-extension",
        direction: "request",
        payload: req,
      } satisfies WindowMessage,
      "*",
    );
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Returns true if the extension is installed and responsive. */
export async function isExtensionAvailable(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    await sendRequest({ type: "tju:ping", requestId: nextId() }, 1000);
    return true;
  } catch {
    return false;
  }
}

/** Fetch the personal timetable for a given EAMS semester ID. */
export async function fetchSchedule(semesterId: string): Promise<ScheduleEntry[]> {
  return sendRequest<ScheduleEntry[]>({
    type: "tju:fetchSchedule",
    requestId: nextId(),
    semester: semesterId,
  });
}

/**
 * Fetch academic score history. The extension auto-detects whether the account
 * is undergraduate or graduate and returns the matching records + studentType.
 */
export async function fetchScore(): Promise<ScoreResult> {
  return sendRequest<ScoreResult>({
    type: "tju:fetchScore",
    requestId: nextId(),
  });
}

/** Fetch the exam schedule for a given EAMS semester ID. */
export async function fetchExam(semesterId: string): Promise<ExamEntry[]> {
  return sendRequest<ExamEntry[]>({
    type: "tju:fetchExam",
    requestId: nextId(),
    semester: semesterId,
  });
}

// ---------------------------------------------------------------------------
// Storage helpers — persist extension-fetched data in localStorage so it
// survives page navigations, tab closes and browser restarts (until refreshed).
// (sessionStorage was used before, which cleared on tab/browser close.)
// ---------------------------------------------------------------------------

const STORAGE_KEYS = {
  schedule: "tju:schedule",
  score: "tju:score",
  exam: "tju:exam",
} as const;

/** Safe localStorage read (returns null if unavailable or unparsable). */
function readStore<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/** Safe localStorage write (silently ignores quota/availability errors). */
function writeStore(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore (private mode, quota, etc.)
  }
}

export function saveScheduleCache(semesterId: string, data: ScheduleEntry[]): void {
  writeStore(`${STORAGE_KEYS.schedule}:${semesterId}`, data);
}

export function loadScheduleCache(semesterId: string): ScheduleEntry[] | null {
  return readStore<ScheduleEntry[]>(`${STORAGE_KEYS.schedule}:${semesterId}`);
}

export function saveScoreCache(data: ScoreResult): void {
  writeStore(STORAGE_KEYS.score, data);
}

export function loadScoreCache(): ScoreResult | null {
  return readStore<ScoreResult>(STORAGE_KEYS.score);
}

export function saveExamCache(semesterId: string, data: ExamEntry[]): void {
  writeStore(`${STORAGE_KEYS.exam}:${semesterId}`, data);
}

export function loadExamCache(semesterId: string): ExamEntry[] | null {
  return readStore<ExamEntry[]>(`${STORAGE_KEYS.exam}:${semesterId}`);
}
