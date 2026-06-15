/**
 * @tju-app/eams-parsers
 *
 * Framework-agnostic TypeScript library for parsing TJU EAMS HTML pages.
 *
 * All parser functions are pure: they take an HTML string and return typed
 * objects.  No network calls are made here — the extension (or any other
 * caller) provides HTTP functionality.
 *
 * Public API:
 *   - Parsers:   parseSchedule, parseExam, parseExamBatchId,
 *                parseUGScore, parseGSScore, parseExpScore,
 *                parseCourse, parseCourseInfo, parseSyllabus,
 *                parseProfile, parseFreeClassroom
 *   - Consts:    SEMESTER, EAMS_BASE, COURSETABLE_PATH, … (all URL paths)
 *   - Types:     ScheduleEntry, ExamEntry, UGScoreRecord, GSScoreRecord, …
 */

// Parsers
export { parseSchedule } from "./parsers/schedule.js";
export { parseExam, parseExamBatchId } from "./parsers/exam.js";
export { parseUGScore, parseGSScore, parseExpScore } from "./parsers/score.js";
export { parseCourse, parseCourseInfo, parseSyllabus } from "./parsers/course.js";
export { parseProfile } from "./parsers/profile.js";
export { parseFreeClassroom } from "./parsers/classroom.js";

// Error classes
export { ParseError as ScheduleParseError } from "./parsers/schedule.js";
export { ParseError as ExamParseError } from "./parsers/exam.js";
export { ParseError as ScoreParseError } from "./parsers/score.js";
export { ParseError as CourseParseError } from "./parsers/course.js";
export { DataError as ClassroomDataError, ParseError as ClassroomParseError } from "./parsers/classroom.js";

// Types
export type {
  Arrange,
  ScheduleEntry,
  ExamEntry,
  UGScoreRecord,
  GSScoreRecord,
  ExpScoreRecord,
  CourseEntry,
  CourseArrangeRaw,
  CoursePageResult,
  CourseInfo,
  ProfileResult,
  FreeClassroomEntry,
  Student,
} from "./types.js";

// Constants
export {
  LOGIN_URL,
  LOGOUT_URL,
  CAPTCHA_URL,
  EAMS_BASE,
  HOME_PATH,
  ID_PATH,
  PROFILE_PATH,
  COURSETABLE_INDEX_PATH,
  COURSETABLE_GET_PATH,
  COURSETABLE_PATH,
  SCORE_HISTORY_PATH,
  SCORE_SEARCH_PATH,
  SCORE_EXP_PATH,
  EXAM_POST_PATH,
  EXAM_PATH,
  COURSELIB_PATH,
  COURSE_SYLLABUS_PATH,
  COURSE_INFO_PATH,
  FREE_CLASSROOM_PATH,
  FREE_CLASSROOM_SEARCH_PATH,
  SEMESTER,
  CHINESE_WEEKDAY,
  PROJECT_ID,
} from "./consts.js";
