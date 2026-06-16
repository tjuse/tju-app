/**
 * MV3 background service worker.
 *
 * Handles messages from the content script, performs EAMS fetches using the
 * user's existing session cookies (campus-network / VPN required), parses the
 * HTML with eams-parsers, and returns typed data.
 *
 * No credentials are stored — the extension piggybacks on the browser's own
 * EAMS session.  If the session has expired, it opens the CAS login page so the
 * user can log back in, then retries.
 */

import {
  parseExam,
  parseExamBatchId,
  parseGSScore,
  parseSchedule,
  parseUGScore,
} from "@tju-app/eams-parsers";

import {
  examSteps,
  extractScheduleIds,
  type Identity,
  identityStep,
  parseIdentity,
  scheduleSteps,
  scoreSteps,
} from "../shared/flows.js";

import type {
  ExtensionRequest,
  ExtensionResponse,
  FetchExamRequest,
  FetchScheduleRequest,
  FetchScoreRequest,
} from "../shared/messages.js";

// ---------------------------------------------------------------------------
// CAS session detection
// ---------------------------------------------------------------------------

const CAS_LOGIN_PATH = "/cas/login";

/** Return true if the response is a CAS login redirect (session expired). */
function isCasRedirect(response: Response): boolean {
  return response.redirected && response.url.includes(CAS_LOGIN_PATH);
}

/** Open the TJU CAS login page so the user can log back in manually. */
function openLoginPage(): void {
  void chrome.tabs.create({ url: "https://sso.tju.edu.cn/cas/login" });
}

// ---------------------------------------------------------------------------
// Fetch helper
// ---------------------------------------------------------------------------

interface FetchOptions {
  method: "GET" | "POST";
  url: string;
  params?: Record<string, string>;
  formData?: Record<string, string>;
}

async function eamsFetch(opts: FetchOptions): Promise<string> {
  let url = opts.url;
  if (opts.params) {
    const qs = new URLSearchParams(opts.params).toString();
    url = `${url}?${qs}`;
  }

  const init: RequestInit = { method: opts.method, credentials: "include", redirect: "follow" };
  if (opts.method === "POST" && opts.formData) {
    init.body = new URLSearchParams(opts.formData).toString();
    init.headers = { "Content-Type": "application/x-www-form-urlencoded" };
  }

  const response = await fetch(url, init);

  if (isCasRedirect(response)) {
    openLoginPage();
    throw new Error("SESSION_EXPIRED: TJU session has expired. Please log in again.");
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${url}`);
  }

  return response.text();
}

// ---------------------------------------------------------------------------
// Identity (undergraduate vs graduate) — detected once, then cached
// ---------------------------------------------------------------------------

let identityCache: Identity | null = null;

async function getIdentity(): Promise<Identity> {
  if (identityCache) return identityCache;
  const html = await eamsFetch(identityStep());
  identityCache = parseIdentity(html);
  return identityCache;
}

// ---------------------------------------------------------------------------
// Data-fetch handlers
// ---------------------------------------------------------------------------

async function handleFetchSchedule(req: FetchScheduleRequest): Promise<ExtensionResponse> {
  const { isGs } = await getIdentity();
  const flows = scheduleSteps(req.semester, isGs);

  // UG needs a warm-up GET to the index page first; GS skips it.
  if (flows.warmupStep) await eamsFetch(flows.warmupStep);

  const indexHtml = await eamsFetch(flows.idsStep);
  const ids = extractScheduleIds(indexHtml);
  if (!ids) {
    throw new Error("无法从教务系统获取课表标识（ids），请确认已登录且学期正确。");
  }

  const tableHtml = await eamsFetch(flows.tableStep(ids));
  const data = parseSchedule(tableHtml);
  return { requestId: req.requestId, ok: true, data };
}

async function handleFetchExam(req: FetchExamRequest): Promise<ExtensionResponse> {
  const flows = examSteps(req.semester);

  const batchHtml = await eamsFetch(flows.batchStep);
  const batchId = parseExamBatchId(batchHtml);

  const tableHtml = await eamsFetch(flows.tableStep(batchId));
  const data = parseExam(tableHtml);
  return { requestId: req.requestId, ok: true, data };
}

async function handleFetchScore(req: FetchScoreRequest): Promise<ExtensionResponse> {
  const { isGs } = await getIdentity();
  const flows = scoreSteps(isGs);

  // Warm-up GET to the course-table index sets up the session for the history
  // endpoint (matches tju-python). Then fetch the all-history grade page.
  await eamsFetch(flows.warmupStep);
  const html = await eamsFetch(flows.historyStep);

  const records = isGs ? parseGSScore(html) : parseUGScore(html);
  return {
    requestId: req.requestId,
    ok: true,
    data: { studentType: isGs ? "graduate" : "undergraduate", records },
  };
}

// Minimal base type for unknown request shapes in the fallback branch
interface BaseRequest {
  requestId: string;
  type: string;
}

// ---------------------------------------------------------------------------
// Message dispatcher
// ---------------------------------------------------------------------------

chrome.runtime.onMessage.addListener(
  (message: unknown, _sender, sendResponse: (r: ExtensionResponse) => void) => {
    const req = message as ExtensionRequest;

    if (req.type === "tju:ping") {
      sendResponse({ requestId: req.requestId, ok: true, data: { version: "0.1.3" } });
      return false;
    }

    // Async handlers: return true to keep the message channel open
    const handle = async (): Promise<void> => {
      try {
        let response: ExtensionResponse;
        if (req.type === "tju:fetchSchedule") {
          response = await handleFetchSchedule(req);
        } else if (req.type === "tju:fetchExam") {
          response = await handleFetchExam(req);
        } else if (req.type === "tju:fetchScore") {
          response = await handleFetchScore(req);
        } else {
          response = {
            requestId: (req as BaseRequest).requestId,
            ok: false,
            error: `Unknown request type: ${(req as BaseRequest).type}`,
          };
        }
        sendResponse(response);
      } catch (err) {
        sendResponse({
          requestId: req.requestId,
          ok: false,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    };

    void handle();
    return true; // keep message channel open for async response
  },
);
