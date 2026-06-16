/**
 * Message protocol between the content script (page bridge) and the background
 * service worker.
 *
 * All messages flow as:
 *   Page → window.postMessage → content.ts → chrome.runtime.sendMessage → background.ts
 *   background.ts → sendResponse → content.ts → window.postMessage → Page
 */

import type { ExamEntry, GSScoreRecord, ScheduleEntry, UGScoreRecord } from "@tju-app/eams-parsers";

// ---------------------------------------------------------------------------
// Requests (page → background)
// ---------------------------------------------------------------------------

export type RequestType =
  | "tju:fetchSchedule"
  | "tju:fetchScore"
  | "tju:fetchExam"
  | "tju:fetchSyllabus"
  | "tju:ping";

export interface BaseRequest {
  type: RequestType;
  /** Echoed back in the response so the caller can match async replies. */
  requestId: string;
}

export interface PingRequest extends BaseRequest {
  type: "tju:ping";
}

export interface FetchScheduleRequest extends BaseRequest {
  type: "tju:fetchSchedule";
  semester: string; // EAMS semester ID, e.g. "117"
}

export interface FetchScoreRequest extends BaseRequest {
  type: "tju:fetchScore";
  // Student type is auto-detected by the background worker; no level needed.
}

/** Score result with the auto-detected student type so the UI can render it. */
export interface ScoreResult {
  studentType: "undergraduate" | "graduate";
  records: UGScoreRecord[] | GSScoreRecord[];
}

export interface FetchExamRequest extends BaseRequest {
  type: "tju:fetchExam";
  semester: string; // EAMS semester ID
}

export interface FetchSyllabusRequest extends BaseRequest {
  type: "tju:fetchSyllabus";
  lessionId: string;
}

export type ExtensionRequest =
  | PingRequest
  | FetchScheduleRequest
  | FetchScoreRequest
  | FetchExamRequest
  | FetchSyllabusRequest;

// ---------------------------------------------------------------------------
// Responses (background → page)
// ---------------------------------------------------------------------------

export interface SuccessResponse<T> {
  requestId: string;
  ok: true;
  data: T;
}

export interface ErrorResponse {
  requestId: string;
  ok: false;
  error: string;
}

export type ExtensionResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

export type ScheduleResponse = ExtensionResponse<ScheduleEntry[]>;
export type ScoreResponse = ExtensionResponse<ScoreResult>;
export type ExamResponse = ExtensionResponse<ExamEntry[]>;
/** Raw syllabus HTML — converted to Markdown in the page (needs a DOM). */
export type SyllabusResponse = ExtensionResponse<{ html: string }>;
export type PingResponse = ExtensionResponse<{ version: string }>;

// ---------------------------------------------------------------------------
// Window message envelope (content ↔ page)
// ---------------------------------------------------------------------------

/** Wrapper the content script uses on the window.postMessage channel. */
export interface WindowMessage {
  /** Namespace prefix so we don't collide with other extensions. */
  source: "tju-extension";
  direction: "request" | "response";
  payload: ExtensionRequest | ExtensionResponse;
}
