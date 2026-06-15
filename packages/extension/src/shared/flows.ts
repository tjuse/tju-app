/**
 * EAMS request-flow descriptors.
 *
 * Each flow describes the sequence of HTTP steps needed to obtain a particular
 * dataset, without performing any actual fetching.  The background service
 * worker wires these descriptors to the actual fetch() calls.
 *
 * Ported from tju-python/src/tju/client/api/*.py
 */

import {
  COURSETABLE_INDEX_PATH,
  COURSETABLE_PATH,
  EAMS_BASE,
  EXAM_PATH,
  EXAM_POST_PATH,
  SCORE_HISTORY_PATH,
  SCORE_SEARCH_PATH,
  SEMESTER,
} from "@tju-app/eams-parsers";

export type HttpMethod = "GET" | "POST";

export interface Step {
  method: HttpMethod;
  url: string;
  params?: Record<string, string>;
  formData?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Schedule flow
// ---------------------------------------------------------------------------

/**
 * Build the fetch-schedule step list for a given semester.
 *
 * Step 1: GET courseTableForStd?projectId=1 (UG) — extract "ids","<classIds>"
 * Step 2: POST courseTable with {ignoreHead:1, setting.kind:std, semester.id, ids}
 *
 * The caller must execute step 1, extract `ids` from the response HTML, then
 * execute step 2 and parse the returned HTML with parseSchedule().
 */
export function scheduleSteps(semesterId: string): {
  indexStep: Step;
  tableStep: (ids: string) => Step;
} {
  return {
    indexStep: {
      method: "GET",
      url: `${EAMS_BASE}${COURSETABLE_INDEX_PATH}`,
      params: { projectId: "1" },
    },
    tableStep: (ids: string) => ({
      method: "POST",
      url: `${EAMS_BASE}${COURSETABLE_PATH}`,
      formData: {
        ignoreHead: "1",
        "setting.kind": "std",
        "semester.id": semesterId,
        ids: ids,
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
 * Build the fetch-exam step list for a given semester.
 *
 * Step 1: POST stdExamTable with {semester.id} — extract batch ID
 * Step 2: GET !examTable with {examBatch.id}
 */
export function examSteps(semesterId: string): {
  batchStep: Step;
  tableStep: (batchId: string) => Step;
} {
  return {
    batchStep: {
      method: "POST",
      url: `${EAMS_BASE}${EXAM_POST_PATH}`,
      formData: { "semester.id": semesterId },
    },
    tableStep: (batchId: string) => ({
      method: "GET",
      url: `${EAMS_BASE}${EXAM_PATH}`,
      params: { "examBatch.id": batchId },
    }),
  };
}

// ---------------------------------------------------------------------------
// Score flow
// ---------------------------------------------------------------------------

/**
 * Build the fetch-score step for UG (undergraduate).
 * Single GET to historyCourseGrade with projectType=MAJOR.
 */
export function ugScoreStep(): Step {
  return {
    method: "GET",
    url: `${EAMS_BASE}${SCORE_HISTORY_PATH}`,
    params: { projectType: "MAJOR" },
  };
}

/**
 * Build the fetch-score step for GS (graduate).
 * GET !search with semesterId and projectType=MAJOR.
 */
export function gsScoreStep(semesterId: string): Step {
  return {
    method: "GET",
    url: `${EAMS_BASE}${SCORE_SEARCH_PATH}`,
    params: { semesterId, projectType: "MAJOR" },
  };
}

// ---------------------------------------------------------------------------
// Semester lookup
// ---------------------------------------------------------------------------

/** Map a 5-digit semester code (e.g. "25262") to its EAMS semester ID. */
export function semesterCodeToId(code: string): string | undefined {
  return SEMESTER[code];
}
