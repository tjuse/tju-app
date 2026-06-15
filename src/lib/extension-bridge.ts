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

/** Fetch undergraduate academic score history. */
export async function fetchUGScore(): Promise<UGScoreRecord[]> {
  return sendRequest<UGScoreRecord[]>({
    type: "tju:fetchScore",
    requestId: nextId(),
    level: "UG",
  });
}

/** Fetch graduate academic score history. */
export async function fetchGSScore(): Promise<GSScoreRecord[]> {
  return sendRequest<GSScoreRecord[]>({
    type: "tju:fetchScore",
    requestId: nextId(),
    level: "GS",
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
// Storage helpers — persist extension-fetched data in sessionStorage so the
// data survives page navigations within the same browser tab.
// ---------------------------------------------------------------------------

const STORAGE_KEYS = {
  schedule: "tju:schedule",
  scoreUG: "tju:score:ug",
  scoreGS: "tju:score:gs",
  exam: "tju:exam",
} as const;

export function saveScheduleCache(semesterId: string, data: ScheduleEntry[]): void {
  sessionStorage.setItem(`${STORAGE_KEYS.schedule}:${semesterId}`, JSON.stringify(data));
}

export function loadScheduleCache(semesterId: string): ScheduleEntry[] | null {
  const raw = sessionStorage.getItem(`${STORAGE_KEYS.schedule}:${semesterId}`);
  return raw ? (JSON.parse(raw) as ScheduleEntry[]) : null;
}

export function saveScoreCache(level: "UG" | "GS", data: UGScoreRecord[] | GSScoreRecord[]): void {
  const key = level === "UG" ? STORAGE_KEYS.scoreUG : STORAGE_KEYS.scoreGS;
  sessionStorage.setItem(key, JSON.stringify(data));
}

export function loadScoreCache(level: "UG"): UGScoreRecord[] | null;
export function loadScoreCache(level: "GS"): GSScoreRecord[] | null;
export function loadScoreCache(level: "UG" | "GS"): UGScoreRecord[] | GSScoreRecord[] | null {
  const key = level === "UG" ? STORAGE_KEYS.scoreUG : STORAGE_KEYS.scoreGS;
  const raw = sessionStorage.getItem(key);
  return raw ? (JSON.parse(raw) as UGScoreRecord[] | GSScoreRecord[]) : null;
}

export function saveExamCache(semesterId: string, data: ExamEntry[]): void {
  sessionStorage.setItem(`${STORAGE_KEYS.exam}:${semesterId}`, JSON.stringify(data));
}

export function loadExamCache(semesterId: string): ExamEntry[] | null {
  const raw = sessionStorage.getItem(`${STORAGE_KEYS.exam}:${semesterId}`);
  return raw ? (JSON.parse(raw) as ExamEntry[]) : null;
}
