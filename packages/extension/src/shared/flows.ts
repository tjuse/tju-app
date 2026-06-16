/**
 * EAMS request-flow descriptors.
 *
 * Each flow describes the sequence of HTTP steps needed to obtain a particular
 * dataset, without performing any actual fetching.  The background service
 * worker wires these descriptors to the actual fetch() calls.
 *
 * Ported from tju-python/src/tju/client/api/*.py — including the undergraduate
 * vs graduate branching (projectId 1 vs 22) that the earlier version omitted.
 */

import {
  COURSE_SYLLABUS_PATH,
  COURSETABLE_GET_PATH,
  COURSETABLE_INDEX_PATH,
  COURSETABLE_PATH,
  EAMS_BASE,
  EXAM_PATH,
  EXAM_POST_PATH,
  ID_PATH,
  SCORE_HISTORY_PATH,
  SEMESTER,
} from "@tju-app/eams-parsers";

export type HttpMethod = "GET" | "POST";

export interface Step {
  method: HttpMethod;
  url: string;
  params?: Record<string, string>;
  formData?: Record<string, string>;
}

/** undergraduate=1 (major), graduate=22. (minor=2 is not exposed here.) */
function projectIdFor(isGs: boolean): string {
  return isGs ? "22" : "1";
}

// ---------------------------------------------------------------------------
// Identity (student type / minor) — mirrors Client.stu_type in tju-python
// ---------------------------------------------------------------------------

/** POST dataQuery.action and inspect the HTML for 研究 (graduate) / 辅修 (minor). */
export function identityStep(): Step {
  return {
    method: "POST",
    url: `${EAMS_BASE}${ID_PATH}`,
    params: { entityId: "" },
  };
}

export interface Identity {
  isGs: boolean;
  hasMinor: boolean;
}

export function parseIdentity(html: string): Identity {
  return { isGs: html.includes("研究"), hasMinor: html.includes("辅修") };
}

// ---------------------------------------------------------------------------
// Schedule flow
// ---------------------------------------------------------------------------

/**
 * Build the fetch-schedule steps for a semester.
 *
 * UG: GET !index (warm-up) → GET !innerIndex → extract ids → POST !courseTable.
 * GS: (no warm-up) GET !innerIndex → extract ids → POST !courseTable.
 */
export function scheduleSteps(
  semesterId: string,
  isGs: boolean,
): {
  warmupStep: Step | null;
  idsStep: Step;
  tableStep: (ids: string) => Step;
} {
  const projectId = projectIdFor(isGs);
  return {
    warmupStep: isGs
      ? null
      : { method: "GET", url: `${EAMS_BASE}${COURSETABLE_INDEX_PATH}`, params: { projectId } },
    idsStep: {
      method: "GET",
      url: `${EAMS_BASE}${COURSETABLE_GET_PATH}`,
      params: { projectId },
    },
    // NOTE: tju-python issues this POST with `params=` — i.e. the values go in
    // the URL query string, not the request body. EAMS ignores a form body here,
    // so sending them as formData returns a page with no TaskActivity section.
    tableStep: (ids: string) => ({
      method: "POST",
      url: `${EAMS_BASE}${COURSETABLE_PATH}`,
      params: {
        ignoreHead: "1",
        "setting.kind": "std",
        startWeek: "",
        "semester.id": semesterId,
        ids,
      },
    }),
  };
}

/** Extract the `ids` value from the schedule index response (JS variable). */
export function extractScheduleIds(html: string): string | null {
  const m = /"ids","([^"]+)"/.exec(html);
  return m ? (m[1] ?? null) : null;
}

// ---------------------------------------------------------------------------
// Exam flow
// ---------------------------------------------------------------------------

/**
 * Build the fetch-exam steps for a semester.
 *
 * The EAMS exam page (`semesterForm`) submits BOTH `project.id` (UG=1 / GS=22)
 * and `semester.id`. Omitting `project.id` makes EAMS ignore the semester switch
 * and return the currently-active batch, so the exam list came back for the
 * wrong semester. We now send both, matching the form.
 */
export function examSteps(
  semesterId: string,
  isGs: boolean,
): {
  batchStep: Step;
  tableStep: (batchId: string) => Step;
} {
  return {
    batchStep: {
      method: "POST",
      url: `${EAMS_BASE}${EXAM_POST_PATH}`,
      formData: { "project.id": projectIdFor(isGs), "semester.id": semesterId },
    },
    tableStep: (batchId: string) => ({
      method: "GET",
      url: `${EAMS_BASE}${EXAM_PATH}`,
      params: { "examBatch.id": batchId },
    }),
  };
}

// ---------------------------------------------------------------------------
// Score flow (all-history) — same endpoint for UG and GS
// ---------------------------------------------------------------------------

/**
 * Build the all-history score steps.
 *
 * Mirrors tju-python score() with semester=None: a warm-up GET to the course
 * table index (with the right projectId) followed by GET !historyCourseGrade.
 * The same endpoint serves both UG and GS — the caller picks the parser.
 */
export function scoreSteps(isGs: boolean): { warmupStep: Step; historyStep: Step } {
  const projectId = projectIdFor(isGs);
  return {
    warmupStep: {
      method: "GET",
      url: `${EAMS_BASE}${COURSETABLE_INDEX_PATH}`,
      params: { projectId },
    },
    historyStep: {
      method: "GET",
      url: `${EAMS_BASE}${SCORE_HISTORY_PATH}`,
      params: { projectType: "MAJOR" },
    },
  };
}

// ---------------------------------------------------------------------------
// Syllabus flow (public course library) — same endpoint as tju-python
// ---------------------------------------------------------------------------

/**
 * Build the syllabus step. Like courseTable, tju-python sends `lesson.id` via
 * `params=` (query string), so we put it in the query string too. Returns raw
 * HTML; the page converts it to Markdown (turndown needs a DOM).
 */
export function syllabusStep(lessionId: string): Step {
  return {
    method: "POST",
    url: `${EAMS_BASE}${COURSE_SYLLABUS_PATH}`,
    params: { "lesson.id": lessionId },
  };
}

// ---------------------------------------------------------------------------
// Semester lookup
// ---------------------------------------------------------------------------

/** Map a 5-digit semester code (e.g. "25262") to its EAMS semester ID. */
export function semesterCodeToId(code: string): string | undefined {
  return SEMESTER[code];
}
