/**
 * TJU EAMS URL constants and lookup tables.
 * Ported from tju-python/src/tju/consts.py
 */

// SSO / CAS
export const LOGIN_URL = "https://sso.tju.edu.cn/cas/login";
export const LOGOUT_URL = "https://sso.tju.edu.cn/cas/logout";
export const CAPTCHA_URL = "https://sso.tju.edu.cn/cas/code";

// EAMS base (plain HTTP — requires campus net / VPN)
export const EAMS_BASE = "http://classes.tju.edu.cn";

// Identity
export const HOME_PATH = "/eams/homeExt.action";
export const ID_PATH = "/eams/dataQuery.action";

// Profile
export const PROFILE_PATH = "/eams/stdDetail.action";

// Personal schedule (course table)
export const COURSETABLE_INDEX_PATH = "/eams/courseTableForStd!index.action";
export const COURSETABLE_GET_PATH = "/eams/courseTableForStd!innerIndex.action";
export const COURSETABLE_PATH = "/eams/courseTableForStd!courseTable.action";

// Academic scores
export const SCORE_HISTORY_PATH = "/eams/teach/grade/course/person!historyCourseGrade.action";
export const SCORE_SEARCH_PATH = "/eams/teach/grade/course/person!search.action";
export const SCORE_EXP_PATH = "/eams/exp/person.action";

// Exam schedule
export const EXAM_POST_PATH = "/eams/stdExamTable.action";
export const EXAM_PATH = "/eams/stdExamTable!examTable.action";

// Public course library
export const COURSELIB_PATH = "/eams/stdSyllabus!search.action";
export const COURSE_SYLLABUS_PATH = "/eams/stdSyllabus!syllabusInfo.action";
export const COURSE_INFO_PATH = "/eams/stdSyllabus!info.action";

// Free classroom search
export const FREE_CLASSROOM_PATH = "/eams/classroom/apply/free.action";
export const FREE_CLASSROOM_SEARCH_PATH = "/eams/classroom/apply/free!search.action";

/**
 * Map from internal semester code (e.g. "25262") to EAMS numeric semester id.
 * Ported verbatim from tju-python/src/tju/consts.py.
 */
export const SEMESTER: Readonly<Record<string, string>> = {
  "03041": "24",
  "03042": "15",
  "04051": "32",
  "04052": "16",
  "05061": "33",
  "05062": "17",
  "06071": "34",
  "06072": "18",
  "07081": "35",
  "07082": "19",
  "08091": "36",
  "08092": "20",
  "09101": "37",
  "09102": "21",
  "10111": "3",
  "10112": "22",
  "11121": "4",
  "11122": "23",
  "12131": "5",
  "12132": "25",
  "13141": "6",
  "13142": "26",
  "14151": "7",
  "14152": "2",
  "15161": "8",
  "15162": "27",
  "16171": "9",
  "16172": "28",
  "17181": "10",
  "17182": "29",
  "18191": "11",
  "18192": "30",
  "19201": "12",
  "19202": "31",
  "20211": "47",
  "20212": "48",
  "21221": "74",
  "21222": "75",
  "22231": "76",
  "22232": "77",
  "23241": "94",
  "23242": "95",
  "24251": "114",
  "24252": "115",
  "25261": "116",
  "25262": "117",
  "26271": "134",
  "26272": "135",
  "27281": "136",
  "27282": "137",
  "28291": "138",
  "28292": "139",
};

/** Chinese weekday character → ISO weekday number (1=Monday … 7=Sunday). */
export const CHINESE_WEEKDAY: Readonly<Record<string, number>> = {
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  日: 7,
};

/** EAMS project IDs for student type selection. */
export const PROJECT_ID = {
  UNDERGRADUATE: 1,
  GRADUATE: 22,
  MINOR: 2,
} as const;
