"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// --------------------------- DELIMITERS ---------------------------
var LineType;
(function (LineType) {
    LineType[LineType["MESSAGE"] = 0] = "MESSAGE";
    LineType[LineType["META"] = 1] = "META";
})(LineType = exports.LineType || (exports.LineType = {}));
class Line {
    constructor(type, data) {
        this.type = type;
        this.data = data;
    }
}
exports.Line = Line;
class Message {
    constructor(username, body) {
        this.username = username;
        this.body = body;
    }
}
exports.Message = Message;
class Meta {
    constructor(data) {
        this.data = data;
    }
}
exports.Meta = Meta;
var SectionType;
(function (SectionType) {
    SectionType[SectionType["TEXT"] = 0] = "TEXT";
    SectionType[SectionType["FILE"] = 1] = "FILE";
    SectionType[SectionType["BOLD"] = 2] = "BOLD";
    SectionType[SectionType["ITALIC"] = 3] = "ITALIC";
    SectionType[SectionType["STRIKETHROUGH"] = 4] = "STRIKETHROUGH";
    SectionType[SectionType["CODE"] = 5] = "CODE";
    SectionType[SectionType["HEADING1"] = 6] = "HEADING1";
    SectionType[SectionType["HEADING2"] = 7] = "HEADING2";
})(SectionType = exports.SectionType || (exports.SectionType = {}));
class Section {
    constructor(type, data) {
        this.type = type;
        this.data = data;
    }
}
exports.Section = Section;
class FileSection {
    constructor(dir, name, ext) {
        this.dir = dir;
        this.name = name;
        this.ext = ext;
    }
}
exports.FileSection = FileSection;
class BoldSection {
    constructor(data) {
        this.data = data;
    }
}
exports.BoldSection = BoldSection;
class ItalicSection {
    constructor(data) {
        this.data = data;
    }
}
exports.ItalicSection = ItalicSection;
class StrikeThroughSection {
    constructor(data) {
        this.data = data;
    }
}
exports.StrikeThroughSection = StrikeThroughSection;
class CodeSection {
    constructor(data) {
        this.data = data;
    }
}
exports.CodeSection = CodeSection;
class Heading1Section {
    constructor(data) {
        this.data = data;
    }
}
exports.Heading1Section = Heading1Section;
class Heading2Section {
    constructor(data) {
        this.data = data;
    }
}
exports.Heading2Section = Heading2Section;
class Delimiter {
    constructor(type, str, parse) {
        this.type = type;
        this.str = str;
        this.parse = parse;
    }
}
exports.Delimiter = Delimiter;
const delims = {
    body: {
        start: [
            new Delimiter(SectionType.HEADING1, "#", parseHeading1),
            new Delimiter(SectionType.HEADING2, "##", parseHeading2),
        ],
        surround: [
            new Delimiter(SectionType.FILE, "~~", parseFile),
            new Delimiter(SectionType.BOLD, "*", parseBold),
            new Delimiter(SectionType.ITALIC, "_", parseItalic),
            new Delimiter(SectionType.STRIKETHROUGH, "~", parseStrikethrough),
            new Delimiter(SectionType.CODE, "`", parseCode),
        ],
    },
};
// --------------------------- REGEXES ---------------------------
const messageSplit = /^([^:]*):(.*)$/gi;
const fileStringTest = /[a-z]:\\([^\\\w]*\\)*[^\.]*/i;
const filePathSplit = /\\([^\\]*$)/gi;
const fileNameSplit = /\.([^\.]*$)/gi;
const delimsStart = delimRegexes(delims.body.surround, startRegex);
const delimsSurround = delimRegexes(delims.body.surround, surroundRegex);
const delimStart = delimsStart.join("|");
const delimSurround = delimsSurround.join("|");
const delimCombined = `${delimStart}|${delimSurround}`;
// Returns a list of escaped string characters
function escapeChars(str) {
    return str.split("").map((char) => "\\" + char);
}
exports.escapeChars = escapeChars;
// Returns the regex for a start delimiter from its characters
function startRegex(chars) {
    if (chars.length == 0)
        throw new TypeError("Cannot chain list of no chars");
    return `(${chars.join("")}\s[^${chars[0]}]*)`;
}
exports.startRegex = startRegex;
// Returns the regex for a surround delimiter from its characters
function surroundRegex(chars) {
    if (chars.length == 0)
        throw new TypeError("Cannot chain list of no chars");
    const str = chars.join("");
    return `(${str}[^${chars[0]}]*${str})`;
}
exports.surroundRegex = surroundRegex;
// Returns a list of delimiter regexes
function delimRegexes(delims, prepare) {
    return delims.map(({ str }) => prepare(escapeChars(str)));
}
exports.delimRegexes = delimRegexes;
// --------------------------- PARSING ---------------------------
// Returns a chat object that describes the chat string
function parseChat(chatStr) {
    return chatStr.split("\n").map(parseLine);
}
exports.parseChat = parseChat;
// Returns a line object that describes the line string
function parseLine(lineStr) {
    switch (lineStr[0]) {
        case ">":
            return new Line(LineType.MESSAGE, parseMessage(lineStr.substr(1)));
        case "<":
            return new Line(LineType.META, parseMeta(lineStr.substr(1)));
        default:
            throw TypeError("Line must be a message or meta line");
    }
}
exports.parseLine = parseLine;
// Returns a message object that describes the message string
function parseMessage(messageStr) {
    const splitMessage = messageStr.split(messageSplit);
    const userStr = splitMessage[1] || splitMessage[0];
    const bodyStr = splitMessage[2] || "";
    return new Message(userStr, bodyStr === "" ? [] : parseBody(bodyStr));
}
exports.parseMessage = parseMessage;
// Returns a meta object that describes the meta string
function parseMeta(metaStr) {
    return new Meta(metaStr);
}
exports.parseMeta = parseMeta;
// Returns a body object that describes the body string
function parseBody(bodyStr) {
    return bodyStr
        .split(new RegExp(delimCombined, "ig"))
        .filter((sectionStr) => sectionStr !== undefined && sectionStr !== "")
        .map((sectionStr) => {
        const isStartSection = sectionStr[0] !== sectionStr.slice(-1);
        return isStartSection
            ? parseStartSection(sectionStr)
            : parseSurroundSection(sectionStr);
    });
}
exports.parseBody = parseBody;
// Returns a section object that describes the section string
function parseStartSection(sectionStr) {
    let section;
    const delim = delims.body.start.find(({ str }) => {
        return sectionStr.substr(0, str.length) == str;
    }) || new Delimiter(SectionType.TEXT, "", (str) => str);
    section.type = delim.type;
    section.data = delim.parse(sectionStr.substr(delim.str.length));
    return section;
}
exports.parseStartSection = parseStartSection;
// Returns a section object that describes the section string
function parseSurroundSection(sectionStr) {
    const s_len = sectionStr.length;
    const delim = delims.body.surround.find(({ str }) => {
        const d_len = str.length;
        const l_delim = sectionStr.substr(0, d_len);
        const r_delim = sectionStr.substr(s_len - d_len);
        return l_delim === r_delim && r_delim === str;
    }) || new Delimiter(SectionType.TEXT, "", (str) => str);
    const d_len = delim.str.length;
    return new Section(delim.type, delim.parse(sectionStr.substr(d_len, s_len - 2 * d_len)));
}
exports.parseSurroundSection = parseSurroundSection;
// Returns a file object that describes the file string
function parseFile(fileStr) {
    fileStr = fileStr.replace("/", "\\");
    const isFileString = fileStringTest.test(fileStr);
    if (!isFileString)
        return new FileSection("", "", "");
    // Splits the directory from the file and the filename from the extension
    const pathComponents = fileStr.split(filePathSplit);
    const nameComponents = pathComponents[1].split(fileNameSplit);
    return new FileSection(pathComponents[0] || "", nameComponents[0] || "", nameComponents[1] || "");
}
exports.parseFile = parseFile;
// Returns a bold object that describes the bold string
function parseBold(boldStr) {
    return new BoldSection(boldStr);
}
exports.parseBold = parseBold;
// Returns a italic object that describes the italic string
function parseItalic(italicStr) {
    return new ItalicSection(italicStr);
}
exports.parseItalic = parseItalic;
// Returns a strikethrough object that describes the strikethrough string
function parseStrikethrough(strikethroughStr) {
    return new StrikeThroughSection(strikethroughStr);
}
exports.parseStrikethrough = parseStrikethrough;
// Returns a code object that describes the code string
function parseCode(codeStr) {
    return new CodeSection(codeStr);
}
exports.parseCode = parseCode;
// Returns a heading1 object that describes the heading1 string
function parseHeading1(heading1Str) {
    return new Heading1Section(heading1Str);
}
exports.parseHeading1 = parseHeading1;
// Returns a heading2 object that describes the heading2 string
function parseHeading2(heading2Str) {
    return new Heading2Section(heading2Str);
}
exports.parseHeading2 = parseHeading2;
//# sourceMappingURL=parse.js.map