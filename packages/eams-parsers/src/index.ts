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

// Constants
export {
  CAPTCHA_URL,
  CHINESE_WEEKDAY,
  COURSE_INFO_PATH,
  COURSE_SYLLABUS_PATH,
  COURSELIB_PATH,
  COURSETABLE_GET_PATH,
  COURSETABLE_INDEX_PATH,
  COURSETABLE_PATH,
  EAMS_BASE,
  EXAM_PATH,
  EXAM_POST_PATH,
  FREE_CLASSROOM_PATH,
  FREE_CLASSROOM_SEARCH_PATH,
  HOME_PATH,
  ID_PATH,
  LOGIN_URL,
  LOGOUT_URL,
  PROFILE_PATH,
  PROJECT_ID,
  SCORE_EXP_PATH,
  SCORE_HISTORY_PATH,
  SCORE_SEARCH_PATH,
  SEMESTER,
} from "./consts.js";
export {
  DataError as ClassroomDataError,
  ParseError as ClassroomParseError,
  parseFreeClassroom,
} from "./parsers/classroom.js";
export {
  ParseError as CourseParseError,
  parseCourse,
  parseCourseInfo,
  parseSyllabus,
} from "./parsers/course.js";
export { ParseError as ExamParseError, parseExam, parseExamBatchId } from "./parsers/exam.js";
export { parseProfile } from "./parsers/profile.js";
// Parsers
// Error classes
export { ParseError as ScheduleParseError, parseSchedule } from "./parsers/schedule.js";
export {
  ParseError as ScoreParseError,
  parseExpScore,
  parseGSScore,
  parseUGScore,
} from "./parsers/score.js";
// Types
export type {
  Arrange,
  CourseArrangeRaw,
  CourseEntry,
  CourseInfo,
  CoursePageResult,
  ExamEntry,
  ExpScoreRecord,
  FreeClassroomEntry,
  GSScoreRecord,
  ProfileResult,
  ScheduleEntry,
  Student,
  UGScoreRecord,
} from "./types.js";
