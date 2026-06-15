// ../eams-parsers/src/parsers/schedule.ts
var ParseError = class extends Error {
  constructor(msg) {
    super(msg);
    this.name = "ParseError";
  }
};
function parseSchedule(html) {
  const taskMatch = /in TaskActivity([\s\S]+?)fillTable/.exec(html);
  if (!taskMatch) throw new ParseError("Cannot find TaskActivity section");
  const arrangeHtmls = taskMatch[1].split("var teachers");
  const arrangePairMap = /* @__PURE__ */ new Map();
  for (const arrangeItem of arrangeHtmls.slice(1)) {
    const rawTeachersMatch = /var actTeachers = ([^;]+);/.exec(arrangeItem);
    const teacherArray = rawTeachersMatch ? [...rawTeachersMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1] ?? "") : [];
    const lineList = arrangeItem.split(";");
    const courseLine = (lineList[14] ?? "").split(",");
    const classIDMatch = /\((\w+)\)/.exec(courseLine[4] ?? "");
    if (!classIDMatch) continue;
    const classID = classIDMatch[1];
    const threePairMatch = /"([^"]+)","[^"]*","([^"]*)","([01]+)"/.exec(arrangeItem);
    if (!threePairMatch) continue;
    const location = threePairMatch[2].trim();
    const rawWeeks = threePairMatch[3].trim();
    const weekArray = [];
    for (let i = 0; i < rawWeeks.length; i++) {
      if (rawWeeks[i] === "1") weekArray.push(i);
    }
    const twoPairs = [...arrangeItem.matchAll(/([0-9]+)\*unitCount\+([0-9]+)/g)];
    if (twoPairs.length === 0) continue;
    const weekday = Number.parseInt(twoPairs[0]?.[1] ?? "0", 10) + 1;
    const unitArray = twoPairs.map((m) => Number.parseInt(m[2] ?? "0", 10) + 1);
    const slots = arrangePairMap.get(classID) ?? [];
    slots.push({ teacher: teacherArray, week: weekArray, unit: unitArray, weekday, location });
    arrangePairMap.set(classID, slots);
  }
  const tbodyMatch = /<tbody([\s\S]+?)<\/tbody>/.exec(html);
  if (!tbodyMatch) return [];
  const courses = [];
  const trMatches = [...tbodyMatch[1].matchAll(/<tr([\s\S]+?)<\/tr>/g)];
  for (const trMatch of trMatches) {
    const tr = trMatch[0];
    const tds = [...tr.matchAll(/<td>([\s\S]+?)<\/td>/g)].map((m) => m[1] ?? "");
    if (tds.length <= 9) continue;
    const serialMatch = />(\d*)<\/a>/.exec(tds[1] ?? "");
    if (!serialMatch) continue;
    const serial = serialMatch[1] ?? "";
    const no = tds[2] ?? "";
    let name = tds[3] ?? "";
    if (name.includes("style")) {
      const nameMain = /(.+?)<sup/.exec(name);
      const nameSup = /">(.+?)<\/s/.exec(name);
      if (nameMain && nameSup) {
        name = nameMain[1].trim() + " " + nameSup[1].trim();
      }
    }
    const creditNum = Number.parseFloat(tds[4] ?? "0");
    const credit = creditNum % 1 === 0 ? `${creditNum}.0` : String(creditNum);
    const teachers = (tds[5] ?? "").split(",");
    const weeks = (tds[6] ?? "").trim();
    const campusRaw = tds[9] ?? "";
    const campusMatch = /(.+?校区)/.exec(campusRaw);
    const campus = campusMatch ? campusMatch[1].trim() : "";
    courses.push({
      class_id: serial,
      course_id: no,
      name,
      credit,
      teacher: teachers,
      weeks,
      campus,
      arrange: arrangePairMap.get(serial) ?? []
    });
  }
  return courses;
}

// ../eams-parsers/src/parsers/exam.ts
var ParseError2 = class extends Error {
  constructor(msg) {
    super(msg);
    this.name = "ParseError";
  }
};
function parseExamBatchId(html) {
  const m = /examBatch\.id=(\d+)/.exec(html);
  if (!m) throw new ParseError2("Cannot find examBatch.id in response");
  return m[1] ?? "";
}
function parseExamTime(raw) {
  if (!raw) return null;
  const parts = raw.split("~");
  if (parts.length !== 2) return null;
  return [parts[0]?.trim() ?? "", parts[1]?.trim() ?? ""];
}
function parseExam(html) {
  const keys = [...html.matchAll(/<th.*?>(.+?)<\/th.*?>/g)].map(
    (m) => (m[1] ?? "").trim()
  );
  const tbodyMatch = /<tbody([\s\S]+?)<\/tbody>/.exec(html);
  if (!tbodyMatch) return [];
  const courses = [...tbodyMatch[1].matchAll(/<tr>([\s\S]+?)<\/tr>/g)];
  const exams = [];
  for (const courseMatch of courses) {
    const tr = courseMatch[1] ?? "";
    const cells = [...tr.matchAll(/<td>([\s\S]+?)<\/td>/g)].map((m) => m[1] ?? "");
    if (cells.length === 0) continue;
    const arr = cells.map((cell) => {
      if (cell.includes("color")) {
        const inner = />(.+?)<\/font/.exec(cell);
        return inner ? inner[1] ?? cell : cell;
      }
      return cell;
    });
    if (arr.length !== keys.length) {
      throw new ParseError2(`Failed to parse exam: expected ${keys.length} columns, got ${arr.length}`);
    }
    const raw = {};
    for (let i = 0; i < keys.length; i++) {
      raw[keys[i] ?? ""] = (arr[i] ?? "").trim();
    }
    const entry = {
      class_id: raw["\u8BFE\u7A0B\u5E8F\u53F7"] ?? null,
      name: raw["\u8BFE\u7A0B\u540D\u79F0"] ?? null,
      exam_type: raw["\u8003\u8BD5\u7C7B\u522B"] ?? null,
      exam_date: raw["\u8003\u8BD5\u65E5\u671F"] || null,
      exam_category: raw["\u6279\u6B21"] ?? null,
      exam_time: parseExamTime(raw["\u8003\u8BD5\u5B89\u6392"]),
      location: raw["\u8003\u8BD5\u5730\u70B9"] ?? null,
      seat: raw["\u8003\u573A\u5EA7\u4F4D\u53F7"] ?? null,
      status: raw["\u8003\u8BD5\u60C5\u51B5"] ?? null,
      notice: raw["\u5176\u5B83\u8BF4\u660E"] ?? null
    };
    exams.push(entry);
  }
  return exams;
}

// ../eams-parsers/src/parsers/score.ts
var ParseError3 = class extends Error {
  constructor(msg) {
    super(msg);
    this.name = "ParseError";
  }
};
function formatGPA(raw) {
  if (!raw) return "";
  const n = Number.parseFloat(raw);
  if (Number.isNaN(n) || n === 0) return "";
  return n % 1 === 0 ? `${n}.0` : String(n);
}
function chineseBool(raw) {
  if (raw === void 0 || raw === "") return null;
  return raw === "\u662F";
}
function scoreSemester(raw) {
  return raw || null;
}
function parseGridTables(html) {
  const tables = html.split('<table class="gridtable">');
  const results = [];
  for (const tableHtml of tables.slice(1)) {
    const parts = tableHtml.split("</thead>");
    const headHtml = parts[0] ?? "";
    const bodyHtml = parts[1] ?? "";
    const keys = [...headHtml.matchAll(/<th.*?>(.+?)<\/th>/g)].map(
      (m) => (m[1] ?? "").trim()
    );
    const rowHtmls = bodyHtml.split("</tr>");
    const rows = [];
    for (let rowHtml of rowHtmls) {
      if (rowHtml.includes("<td\n")) rowHtml = rowHtml.replace(/<td\n/g, "<td>");
      rowHtml = rowHtml.replace(
        /(\S+)\t*<sup style=.*?>(.*?)<\/sup>/g,
        (_m, main, sup) => `${main} ${sup}`
      );
      const values = [...rowHtml.matchAll(/<td.*?>\s*(.*?)\s*<\/td>/g)].map(
        (m) => (m[1] ?? "").trim()
      );
      if (values.length !== keys.length) continue;
      const row = {};
      for (let i = 0; i < keys.length; i++) {
        row[keys[i] ?? ""] = values[i] ?? "";
      }
      rows.push(row);
    }
    results.push({ keys, rows });
  }
  return results;
}
function parseUGScore(html) {
  const tables = parseGridTables(html);
  if (tables.length < 1) throw new ParseError3("Score data format Error");
  const isUG = (tables[0]?.keys ?? []).includes("\u603B\u8BC4\u6210\u7EE9");
  const courseTable = isUG ? tables[0] ?? tables[tables.length - 1] : tables[0];
  if (!courseTable) throw new ParseError3("Score data format Error");
  const coursesTable = tables.length >= 2 ? tables[tables.length - 1] ?? courseTable : courseTable;
  return (coursesTable.rows ?? []).map((raw) => ({
    semester: scoreSemester(raw["\u5B66\u5E74\u5B66\u671F"]),
    course_id: raw["\u8BFE\u7A0B\u4EE3\u7801"] || null,
    name: raw["\u8BFE\u7A0B\u540D\u79F0"] || null,
    course_type: raw["\u8BFE\u7A0B\u7C7B\u522B"] || null,
    course_props: raw["\u8BFE\u7A0B\u6027\u8D28"] ?? null,
    credit: raw["\u5B66\u5206"] ? Number.parseFloat(raw["\u5B66\u5206"]) : null,
    score: raw["\u603B\u8BC4\u6210\u7EE9"] || null,
    gpa: formatGPA(raw["\u7EE9\u70B9"])
  }));
}
function parseGSScore(html) {
  const tables = parseGridTables(html);
  if (tables.length < 1) throw new ParseError3("Score data format Error");
  const coursesTable = tables[tables.length - 1];
  if (!coursesTable) throw new ParseError3("Score data format Error");
  return coursesTable.rows.map((raw) => ({
    semester: scoreSemester(raw["\u5B66\u5E74\u5B66\u671F"]),
    class_id: raw["\u8BFE\u7A0B\u5E8F\u53F7"] || null,
    course_id: raw["\u8BFE\u7A0B\u4EE3\u7801"] || null,
    name: raw["\u8BFE\u7A0B\u540D\u79F0"] || null,
    course_type: raw["\u8BFE\u7A0B\u7C7B\u522B"] || null,
    credit: raw["\u5B66\u5206"] ? Number.parseFloat(raw["\u5B66\u5206"]) : null,
    exam_status: raw["\u8003\u8BD5\u60C5\u51B5"] || null,
    score: raw["\u6700\u7EC8"] || null,
    is_in_plan: chineseBool(raw["\u662F\u5426\u65B9\u6848\u5185\u8BFE\u7A0B"]),
    is_credited: chineseBool(raw["\u9009\u4FEE\u8BFE\u662F\u5426\u8BA4\u5B9A\u5B66\u5206"])
  }));
}

// ../../node_modules/.pnpm/turndown@7.2.4/node_modules/turndown/lib/turndown.browser.es.js
function extend(destination) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];
    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) destination[key] = source[key];
    }
  }
  return destination;
}
function repeat(character, count) {
  return Array(count + 1).join(character);
}
function trimLeadingNewlines(string) {
  return string.replace(/^\n*/, "");
}
function trimTrailingNewlines(string) {
  var indexEnd = string.length;
  while (indexEnd > 0 && string[indexEnd - 1] === "\n") indexEnd--;
  return string.substring(0, indexEnd);
}
function trimNewlines(string) {
  return trimTrailingNewlines(trimLeadingNewlines(string));
}
var blockElements = ["ADDRESS", "ARTICLE", "ASIDE", "AUDIO", "BLOCKQUOTE", "BODY", "CANVAS", "CENTER", "DD", "DIR", "DIV", "DL", "DT", "FIELDSET", "FIGCAPTION", "FIGURE", "FOOTER", "FORM", "FRAMESET", "H1", "H2", "H3", "H4", "H5", "H6", "HEADER", "HGROUP", "HR", "HTML", "ISINDEX", "LI", "MAIN", "MENU", "NAV", "NOFRAMES", "NOSCRIPT", "OL", "OUTPUT", "P", "PRE", "SECTION", "TABLE", "TBODY", "TD", "TFOOT", "TH", "THEAD", "TR", "UL"];
function isBlock(node) {
  return is(node, blockElements);
}
var voidElements = ["AREA", "BASE", "BR", "COL", "COMMAND", "EMBED", "HR", "IMG", "INPUT", "KEYGEN", "LINK", "META", "PARAM", "SOURCE", "TRACK", "WBR"];
function isVoid(node) {
  return is(node, voidElements);
}
function hasVoid(node) {
  return has(node, voidElements);
}
var meaningfulWhenBlankElements = ["A", "TABLE", "THEAD", "TBODY", "TFOOT", "TH", "TD", "IFRAME", "SCRIPT", "AUDIO", "VIDEO"];
function isMeaningfulWhenBlank(node) {
  return is(node, meaningfulWhenBlankElements);
}
function hasMeaningfulWhenBlank(node) {
  return has(node, meaningfulWhenBlankElements);
}
function is(node, tagNames) {
  return tagNames.indexOf(node.nodeName) >= 0;
}
function has(node, tagNames) {
  return node.getElementsByTagName && tagNames.some(function(tagName) {
    return node.getElementsByTagName(tagName).length;
  });
}
var markdownEscapes = [[/\\/g, "\\\\"], [/\*/g, "\\*"], [/^-/g, "\\-"], [/^\+ /g, "\\+ "], [/^(=+)/g, "\\$1"], [/^(#{1,6}) /g, "\\$1 "], [/`/g, "\\`"], [/^~~~/g, "\\~~~"], [/\[/g, "\\["], [/\]/g, "\\]"], [/^>/g, "\\>"], [/_/g, "\\_"], [/^(\d+)\. /g, "$1\\. "]];
function escapeMarkdown(string) {
  return markdownEscapes.reduce(function(accumulator, escape) {
    return accumulator.replace(escape[0], escape[1]);
  }, string);
}
var rules = {};
rules.paragraph = {
  filter: "p",
  replacement: function(content) {
    return "\n\n" + content + "\n\n";
  }
};
rules.lineBreak = {
  filter: "br",
  replacement: function(content, node, options) {
    return options.br + "\n";
  }
};
rules.heading = {
  filter: ["h1", "h2", "h3", "h4", "h5", "h6"],
  replacement: function(content, node, options) {
    var hLevel = Number(node.nodeName.charAt(1));
    if (options.headingStyle === "setext" && hLevel < 3) {
      var underline = repeat(hLevel === 1 ? "=" : "-", content.length);
      return "\n\n" + content + "\n" + underline + "\n\n";
    } else {
      return "\n\n" + repeat("#", hLevel) + " " + content + "\n\n";
    }
  }
};
rules.blockquote = {
  filter: "blockquote",
  replacement: function(content) {
    content = trimNewlines(content).replace(/^/gm, "> ");
    return "\n\n" + content + "\n\n";
  }
};
rules.list = {
  filter: ["ul", "ol"],
  replacement: function(content, node) {
    var parent = node.parentNode;
    if (parent.nodeName === "LI" && parent.lastElementChild === node) {
      return "\n" + content;
    } else {
      return "\n\n" + content + "\n\n";
    }
  }
};
rules.listItem = {
  filter: "li",
  replacement: function(content, node, options) {
    var prefix = options.bulletListMarker + "   ";
    var parent = node.parentNode;
    if (parent.nodeName === "OL") {
      var start = parent.getAttribute("start");
      var index = Array.prototype.indexOf.call(parent.children, node);
      prefix = (start ? Number(start) + index : index + 1) + ".  ";
    }
    var isParagraph = /\n$/.test(content);
    content = trimNewlines(content) + (isParagraph ? "\n" : "");
    content = content.replace(/\n/gm, "\n" + " ".repeat(prefix.length));
    return prefix + content + (node.nextSibling ? "\n" : "");
  }
};
rules.indentedCodeBlock = {
  filter: function(node, options) {
    return options.codeBlockStyle === "indented" && node.nodeName === "PRE" && node.firstChild && node.firstChild.nodeName === "CODE";
  },
  replacement: function(content, node, options) {
    return "\n\n    " + node.firstChild.textContent.replace(/\n/g, "\n    ") + "\n\n";
  }
};
rules.fencedCodeBlock = {
  filter: function(node, options) {
    return options.codeBlockStyle === "fenced" && node.nodeName === "PRE" && node.firstChild && node.firstChild.nodeName === "CODE";
  },
  replacement: function(content, node, options) {
    var className = node.firstChild.getAttribute("class") || "";
    var language = (className.match(/language-(\S+)/) || [null, ""])[1];
    var code = node.firstChild.textContent;
    var fenceChar = options.fence.charAt(0);
    var fenceSize = 3;
    var fenceInCodeRegex = new RegExp("^" + fenceChar + "{3,}", "gm");
    var match;
    while (match = fenceInCodeRegex.exec(code)) {
      if (match[0].length >= fenceSize) {
        fenceSize = match[0].length + 1;
      }
    }
    var fence = repeat(fenceChar, fenceSize);
    return "\n\n" + fence + language + "\n" + code.replace(/\n$/, "") + "\n" + fence + "\n\n";
  }
};
rules.horizontalRule = {
  filter: "hr",
  replacement: function(content, node, options) {
    return "\n\n" + options.hr + "\n\n";
  }
};
rules.inlineLink = {
  filter: function(node, options) {
    return options.linkStyle === "inlined" && node.nodeName === "A" && node.getAttribute("href");
  },
  replacement: function(content, node) {
    var href = escapeLinkDestination(node.getAttribute("href"));
    var title = escapeLinkTitle(cleanAttribute(node.getAttribute("title")));
    var titlePart = title ? ' "' + title + '"' : "";
    return "[" + content + "](" + href + titlePart + ")";
  }
};
rules.referenceLink = {
  filter: function(node, options) {
    return options.linkStyle === "referenced" && node.nodeName === "A" && node.getAttribute("href");
  },
  replacement: function(content, node, options) {
    var href = escapeLinkDestination(node.getAttribute("href"));
    var title = cleanAttribute(node.getAttribute("title"));
    if (title) title = ' "' + escapeLinkTitle(title) + '"';
    var replacement;
    var reference;
    switch (options.linkReferenceStyle) {
      case "collapsed":
        replacement = "[" + content + "][]";
        reference = "[" + content + "]: " + href + title;
        break;
      case "shortcut":
        replacement = "[" + content + "]";
        reference = "[" + content + "]: " + href + title;
        break;
      default:
        var id = this.references.length + 1;
        replacement = "[" + content + "][" + id + "]";
        reference = "[" + id + "]: " + href + title;
    }
    this.references.push(reference);
    return replacement;
  },
  references: [],
  append: function(options) {
    var references = "";
    if (this.references.length) {
      references = "\n\n" + this.references.join("\n") + "\n\n";
      this.references = [];
    }
    return references;
  }
};
rules.emphasis = {
  filter: ["em", "i"],
  replacement: function(content, node, options) {
    if (!content.trim()) return "";
    return options.emDelimiter + content + options.emDelimiter;
  }
};
rules.strong = {
  filter: ["strong", "b"],
  replacement: function(content, node, options) {
    if (!content.trim()) return "";
    return options.strongDelimiter + content + options.strongDelimiter;
  }
};
rules.code = {
  filter: function(node) {
    var hasSiblings = node.previousSibling || node.nextSibling;
    var isCodeBlock = node.parentNode.nodeName === "PRE" && !hasSiblings;
    return node.nodeName === "CODE" && !isCodeBlock;
  },
  replacement: function(content) {
    if (!content) return "";
    content = content.replace(/\r?\n|\r/g, " ");
    var extraSpace = /^`|^ .*?[^ ].* $|`$/.test(content) ? " " : "";
    var delimiter = "`";
    var matches = content.match(/`+/gm) || [];
    while (matches.indexOf(delimiter) !== -1) delimiter = delimiter + "`";
    return delimiter + extraSpace + content + extraSpace + delimiter;
  }
};
rules.image = {
  filter: "img",
  replacement: function(content, node) {
    var alt = escapeMarkdown(cleanAttribute(node.getAttribute("alt")));
    var src = escapeLinkDestination(node.getAttribute("src") || "");
    var title = cleanAttribute(node.getAttribute("title"));
    var titlePart = title ? ' "' + escapeLinkTitle(title) + '"' : "";
    return src ? "![" + alt + "](" + src + titlePart + ")" : "";
  }
};
function cleanAttribute(attribute) {
  return attribute ? attribute.replace(/(\n+\s*)+/g, "\n") : "";
}
function escapeLinkDestination(destination) {
  var escaped = destination.replace(/([<>()])/g, "\\$1");
  return escaped.indexOf(" ") >= 0 ? "<" + escaped + ">" : escaped;
}
function escapeLinkTitle(title) {
  return title.replace(/"/g, '\\"');
}
function Rules(options) {
  this.options = options;
  this._keep = [];
  this._remove = [];
  this.blankRule = {
    replacement: options.blankReplacement
  };
  this.keepReplacement = options.keepReplacement;
  this.defaultRule = {
    replacement: options.defaultReplacement
  };
  this.array = [];
  for (var key in options.rules) this.array.push(options.rules[key]);
}
Rules.prototype = {
  add: function(key, rule) {
    this.array.unshift(rule);
  },
  keep: function(filter) {
    this._keep.unshift({
      filter,
      replacement: this.keepReplacement
    });
  },
  remove: function(filter) {
    this._remove.unshift({
      filter,
      replacement: function() {
        return "";
      }
    });
  },
  forNode: function(node) {
    if (node.isBlank) return this.blankRule;
    var rule;
    if (rule = findRule(this.array, node, this.options)) return rule;
    if (rule = findRule(this._keep, node, this.options)) return rule;
    if (rule = findRule(this._remove, node, this.options)) return rule;
    return this.defaultRule;
  },
  forEach: function(fn) {
    for (var i = 0; i < this.array.length; i++) fn(this.array[i], i);
  }
};
function findRule(rules2, node, options) {
  for (var i = 0; i < rules2.length; i++) {
    var rule = rules2[i];
    if (filterValue(rule, node, options)) return rule;
  }
  return void 0;
}
function filterValue(rule, node, options) {
  var filter = rule.filter;
  if (typeof filter === "string") {
    if (filter === node.nodeName.toLowerCase()) return true;
  } else if (Array.isArray(filter)) {
    if (filter.indexOf(node.nodeName.toLowerCase()) > -1) return true;
  } else if (typeof filter === "function") {
    if (filter.call(rule, node, options)) return true;
  } else {
    throw new TypeError("`filter` needs to be a string, array, or function");
  }
}
function collapseWhitespace(options) {
  var element = options.element;
  var isBlock2 = options.isBlock;
  var isVoid2 = options.isVoid;
  var isPre = options.isPre || function(node2) {
    return node2.nodeName === "PRE";
  };
  if (!element.firstChild || isPre(element)) return;
  var prevText = null;
  var keepLeadingWs = false;
  var prev = null;
  var node = next(prev, element, isPre);
  while (node !== element) {
    if (node.nodeType === 3 || node.nodeType === 4) {
      var text = node.data.replace(/[ \r\n\t]+/g, " ");
      if ((!prevText || / $/.test(prevText.data)) && !keepLeadingWs && text[0] === " ") {
        text = text.substr(1);
      }
      if (!text) {
        node = remove(node);
        continue;
      }
      node.data = text;
      prevText = node;
    } else if (node.nodeType === 1) {
      if (isBlock2(node) || node.nodeName === "BR") {
        if (prevText) {
          prevText.data = prevText.data.replace(/ $/, "");
        }
        prevText = null;
        keepLeadingWs = false;
      } else if (isVoid2(node) || isPre(node)) {
        prevText = null;
        keepLeadingWs = true;
      } else if (prevText) {
        keepLeadingWs = false;
      }
    } else {
      node = remove(node);
      continue;
    }
    var nextNode = next(prev, node, isPre);
    prev = node;
    node = nextNode;
  }
  if (prevText) {
    prevText.data = prevText.data.replace(/ $/, "");
    if (!prevText.data) {
      remove(prevText);
    }
  }
}
function remove(node) {
  var next2 = node.nextSibling || node.parentNode;
  node.parentNode.removeChild(node);
  return next2;
}
function next(prev, current, isPre) {
  if (prev && prev.parentNode === current || isPre(current)) {
    return current.nextSibling || current.parentNode;
  }
  return current.firstChild || current.nextSibling || current.parentNode;
}
var root = typeof window !== "undefined" ? window : {};
function canParseHTMLNatively() {
  var Parser = root.DOMParser;
  var canParse = false;
  try {
    if (new Parser().parseFromString("", "text/html")) {
      canParse = true;
    }
  } catch (e) {
  }
  return canParse;
}
function createHTMLParser() {
  var Parser = function() {
  };
  {
    if (shouldUseActiveX()) {
      Parser.prototype.parseFromString = function(string) {
        var doc = new window.ActiveXObject("htmlfile");
        doc.designMode = "on";
        doc.open();
        doc.write(string);
        doc.close();
        return doc;
      };
    } else {
      Parser.prototype.parseFromString = function(string) {
        var doc = document.implementation.createHTMLDocument("");
        doc.open();
        doc.write(string);
        doc.close();
        return doc;
      };
    }
  }
  return Parser;
}
function shouldUseActiveX() {
  var useActiveX = false;
  try {
    document.implementation.createHTMLDocument("").open();
  } catch (e) {
    if (root.ActiveXObject) useActiveX = true;
  }
  return useActiveX;
}
var HTMLParser = canParseHTMLNatively() ? root.DOMParser : createHTMLParser();
function RootNode(input, options) {
  var root2;
  if (typeof input === "string") {
    var doc = htmlParser().parseFromString(
      // DOM parsers arrange elements in the <head> and <body>.
      // Wrapping in a custom element ensures elements are reliably arranged in
      // a single element.
      '<x-turndown id="turndown-root">' + input + "</x-turndown>",
      "text/html"
    );
    root2 = doc.getElementById("turndown-root");
  } else {
    root2 = input.cloneNode(true);
  }
  collapseWhitespace({
    element: root2,
    isBlock,
    isVoid,
    isPre: options.preformattedCode ? isPreOrCode : null
  });
  return root2;
}
var _htmlParser;
function htmlParser() {
  _htmlParser = _htmlParser || new HTMLParser();
  return _htmlParser;
}
function isPreOrCode(node) {
  return node.nodeName === "PRE" || node.nodeName === "CODE";
}
function Node(node, options) {
  node.isBlock = isBlock(node);
  node.isCode = node.nodeName === "CODE" || node.parentNode.isCode;
  node.isBlank = isBlank(node);
  node.flankingWhitespace = flankingWhitespace(node, options);
  return node;
}
function isBlank(node) {
  return !isVoid(node) && !isMeaningfulWhenBlank(node) && /^\s*$/i.test(node.textContent) && !hasVoid(node) && !hasMeaningfulWhenBlank(node);
}
function flankingWhitespace(node, options) {
  if (node.isBlock || options.preformattedCode && node.isCode) {
    return {
      leading: "",
      trailing: ""
    };
  }
  var edges = edgeWhitespace(node.textContent);
  if (edges.leadingAscii && isFlankedByWhitespace("left", node, options)) {
    edges.leading = edges.leadingNonAscii;
  }
  if (edges.trailingAscii && isFlankedByWhitespace("right", node, options)) {
    edges.trailing = edges.trailingNonAscii;
  }
  return {
    leading: edges.leading,
    trailing: edges.trailing
  };
}
function edgeWhitespace(string) {
  var m = string.match(/^(([ \t\r\n]*)(\s*))(?:(?=\S)[\s\S]*\S)?((\s*?)([ \t\r\n]*))$/);
  return {
    leading: m[1],
    // whole string for whitespace-only strings
    leadingAscii: m[2],
    leadingNonAscii: m[3],
    trailing: m[4],
    // empty for whitespace-only strings
    trailingNonAscii: m[5],
    trailingAscii: m[6]
  };
}
function isFlankedByWhitespace(side, node, options) {
  var sibling;
  var regExp;
  var isFlanked;
  if (side === "left") {
    sibling = node.previousSibling;
    regExp = / $/;
  } else {
    sibling = node.nextSibling;
    regExp = /^ /;
  }
  if (sibling) {
    if (sibling.nodeType === 3) {
      isFlanked = regExp.test(sibling.nodeValue);
    } else if (options.preformattedCode && sibling.nodeName === "CODE") {
      isFlanked = false;
    } else if (sibling.nodeType === 1 && !isBlock(sibling)) {
      isFlanked = regExp.test(sibling.textContent);
    }
  }
  return isFlanked;
}
var reduce = Array.prototype.reduce;
function TurndownService(options) {
  if (!(this instanceof TurndownService)) return new TurndownService(options);
  var defaults = {
    rules,
    headingStyle: "setext",
    hr: "* * *",
    bulletListMarker: "*",
    codeBlockStyle: "indented",
    fence: "```",
    emDelimiter: "_",
    strongDelimiter: "**",
    linkStyle: "inlined",
    linkReferenceStyle: "full",
    br: "  ",
    preformattedCode: false,
    blankReplacement: function(content, node) {
      return node.isBlock ? "\n\n" : "";
    },
    keepReplacement: function(content, node) {
      return node.isBlock ? "\n\n" + node.outerHTML + "\n\n" : node.outerHTML;
    },
    defaultReplacement: function(content, node) {
      return node.isBlock ? "\n\n" + content + "\n\n" : content;
    }
  };
  this.options = extend({}, defaults, options);
  this.rules = new Rules(this.options);
}
TurndownService.prototype = {
  /**
   * The entry point for converting a string or DOM node to Markdown
   * @public
   * @param {String|HTMLElement} input The string or DOM node to convert
   * @returns A Markdown representation of the input
   * @type String
   */
  turndown: function(input) {
    if (!canConvert(input)) {
      throw new TypeError(input + " is not a string, or an element/document/fragment node.");
    }
    if (input === "") return "";
    var output = process.call(this, new RootNode(input, this.options));
    return postProcess.call(this, output);
  },
  /**
   * Add one or more plugins
   * @public
   * @param {Function|Array} plugin The plugin or array of plugins to add
   * @returns The Turndown instance for chaining
   * @type Object
   */
  use: function(plugin) {
    if (Array.isArray(plugin)) {
      for (var i = 0; i < plugin.length; i++) this.use(plugin[i]);
    } else if (typeof plugin === "function") {
      plugin(this);
    } else {
      throw new TypeError("plugin must be a Function or an Array of Functions");
    }
    return this;
  },
  /**
   * Adds a rule
   * @public
   * @param {String} key The unique key of the rule
   * @param {Object} rule The rule
   * @returns The Turndown instance for chaining
   * @type Object
   */
  addRule: function(key, rule) {
    this.rules.add(key, rule);
    return this;
  },
  /**
   * Keep a node (as HTML) that matches the filter
   * @public
   * @param {String|Array|Function} filter The unique key of the rule
   * @returns The Turndown instance for chaining
   * @type Object
   */
  keep: function(filter) {
    this.rules.keep(filter);
    return this;
  },
  /**
   * Remove a node that matches the filter
   * @public
   * @param {String|Array|Function} filter The unique key of the rule
   * @returns The Turndown instance for chaining
   * @type Object
   */
  remove: function(filter) {
    this.rules.remove(filter);
    return this;
  },
  /**
   * Escapes Markdown syntax
   * @public
   * @param {String} string The string to escape
   * @returns A string with Markdown syntax escaped
   * @type String
   */
  escape: function(string) {
    return escapeMarkdown(string);
  }
};
function process(parentNode) {
  var self = this;
  return reduce.call(parentNode.childNodes, function(output, node) {
    node = new Node(node, self.options);
    var replacement = "";
    if (node.nodeType === 3) {
      replacement = node.isCode ? node.nodeValue : self.escape(node.nodeValue);
    } else if (node.nodeType === 1) {
      replacement = replacementForNode.call(self, node);
    }
    return join(output, replacement);
  }, "");
}
function postProcess(output) {
  var self = this;
  this.rules.forEach(function(rule) {
    if (typeof rule.append === "function") {
      output = join(output, rule.append(self.options));
    }
  });
  return output.replace(/^[\t\r\n]+/, "").replace(/[\t\r\n\s]+$/, "");
}
function replacementForNode(node) {
  var rule = this.rules.forNode(node);
  var content = process.call(this, node);
  var whitespace = node.flankingWhitespace;
  if (whitespace.leading || whitespace.trailing) content = content.trim();
  return whitespace.leading + rule.replacement(content, node, this.options) + whitespace.trailing;
}
function join(output, replacement) {
  var s1 = trimTrailingNewlines(output);
  var s2 = trimLeadingNewlines(replacement);
  var nls = Math.max(output.length - s1.length, replacement.length - s2.length);
  var separator = "\n\n".substring(0, nls);
  return s1 + separator + s2;
}
function canConvert(input) {
  return input != null && (typeof input === "string" || input.nodeType && (input.nodeType === 1 || input.nodeType === 9 || input.nodeType === 11));
}

// ../eams-parsers/src/consts.ts
var EAMS_BASE = "http://classes.tju.edu.cn";
var COURSETABLE_INDEX_PATH = "/eams/courseTableForStd!index.action";
var COURSETABLE_PATH = "/eams/courseTableForStd!courseTable.action";
var SCORE_HISTORY_PATH = "/eams/teach/grade/course/person!historyCourseGrade.action";
var SCORE_SEARCH_PATH = "/eams/teach/grade/course/person!search.action";
var EXAM_POST_PATH = "/eams/stdExamTable.action";
var EXAM_PATH = "/eams/stdExamTable!examTable.action";

// ../eams-parsers/src/parsers/course.ts
var _td = new TurndownService();

// src/shared/flows.ts
function scheduleSteps(semesterId) {
  return {
    indexStep: {
      method: "GET",
      url: `${EAMS_BASE}${COURSETABLE_INDEX_PATH}`,
      params: { projectId: "1" }
    },
    tableStep: (ids) => ({
      method: "POST",
      url: `${EAMS_BASE}${COURSETABLE_PATH}`,
      formData: {
        "ignoreHead": "1",
        "setting.kind": "std",
        "semester.id": semesterId,
        "ids": ids
      }
    })
  };
}
function extractScheduleIds(html) {
  const m = /"ids","([^"]+)"/.exec(html);
  return m ? m[1] ?? null : null;
}
function examSteps(semesterId) {
  return {
    batchStep: {
      method: "POST",
      url: `${EAMS_BASE}${EXAM_POST_PATH}`,
      formData: { "semester.id": semesterId }
    },
    tableStep: (batchId) => ({
      method: "GET",
      url: `${EAMS_BASE}${EXAM_PATH}`,
      params: { "examBatch.id": batchId }
    })
  };
}
function ugScoreStep() {
  return {
    method: "GET",
    url: `${EAMS_BASE}${SCORE_HISTORY_PATH}`,
    params: { projectType: "MAJOR" }
  };
}
function gsScoreStep(semesterId) {
  return {
    method: "GET",
    url: `${EAMS_BASE}${SCORE_SEARCH_PATH}`,
    params: { semesterId, projectType: "MAJOR" }
  };
}

// src/background/index.ts
var CAS_LOGIN_PATH = "/cas/login";
function isCasRedirect(response) {
  return response.redirected && response.url.includes(CAS_LOGIN_PATH);
}
function openLoginPage() {
  void chrome.tabs.create({ url: "https://sso.tju.edu.cn/cas/login" });
}
async function eamsFetch(opts) {
  let url = opts.url;
  if (opts.params) {
    const qs = new URLSearchParams(opts.params).toString();
    url = `${url}?${qs}`;
  }
  const init = { method: opts.method, credentials: "include", redirect: "follow" };
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
async function handleFetchSchedule(req) {
  const flows = scheduleSteps(req.semester);
  const indexHtml = await eamsFetch(flows.indexStep);
  const ids = extractScheduleIds(indexHtml);
  if (!ids) {
    throw new Error("Could not extract course IDs from schedule index page.");
  }
  const tableHtml = await eamsFetch(flows.tableStep(ids));
  const data = parseSchedule(tableHtml);
  return { requestId: req.requestId, ok: true, data };
}
async function handleFetchExam(req) {
  const flows = examSteps(req.semester);
  const batchHtml = await eamsFetch(flows.batchStep);
  const batchId = parseExamBatchId(batchHtml);
  const tableHtml = await eamsFetch(flows.tableStep(batchId));
  const data = parseExam(tableHtml);
  return { requestId: req.requestId, ok: true, data };
}
async function handleFetchScore(req) {
  if (req.level === "UG") {
    const html2 = await eamsFetch(ugScoreStep());
    const data2 = parseUGScore(html2);
    return { requestId: req.requestId, ok: true, data: data2 };
  }
  const html = await eamsFetch(gsScoreStep(""));
  const data = parseGSScore(html);
  return { requestId: req.requestId, ok: true, data };
}
chrome.runtime.onMessage.addListener(
  (message, _sender, sendResponse) => {
    const req = message;
    if (req.type === "tju:ping") {
      sendResponse({ requestId: req.requestId, ok: true, data: { version: "0.1.0" } });
      return false;
    }
    const handle = async () => {
      try {
        let response;
        if (req.type === "tju:fetchSchedule") {
          response = await handleFetchSchedule(req);
        } else if (req.type === "tju:fetchExam") {
          response = await handleFetchExam(req);
        } else if (req.type === "tju:fetchScore") {
          response = await handleFetchScore(req);
        } else {
          response = { requestId: req.requestId, ok: false, error: `Unknown request type: ${req.type}` };
        }
        sendResponse(response);
      } catch (err) {
        sendResponse({
          requestId: req.requestId,
          ok: false,
          error: err instanceof Error ? err.message : String(err)
        });
      }
    };
    void handle();
    return true;
  }
);
