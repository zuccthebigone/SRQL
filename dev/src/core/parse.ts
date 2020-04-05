// --------------------------- DELIMITERS ---------------------------
export enum LineType {
	MESSAGE,
	META,
}

export class Line {
	constructor(public type: LineType, public data: object) {}
}

export class Message {
	constructor(public username: string, public body: object) {}
}

export class Meta {
	constructor(public data: string) {}
}

export enum SectionType {
	TEXT,
	FILE,
	BOLD,
	ITALIC,
	STRIKETHROUGH,
	CODE,
	HEADING1,
	HEADING2,
}

export class Section {
	constructor(public type: SectionType, public data: object | string) {}
}

export class FileSection {
	constructor(public dir: string, public name: string, public ext: string) {}
}

export class BoldSection {
	constructor(public data: string) {}
}

export class ItalicSection {
	constructor(public data: string) {}
}

export class StrikeThroughSection {
	constructor(public data: string) {}
}

export class CodeSection {
	constructor(public data: string) {}
}

export class Heading1Section {
	constructor(public data: string) {}
}

export class Heading2Section {
	constructor(public data: string) {}
}

export class Delimiter {
	constructor(
		public type: SectionType,
		public str: string,
		public parse: Function
	) {}
}

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
export function escapeChars(str: string): string[] {
	return str.split("").map((char) => "\\" + char);
}

// Returns the regex for a start delimiter from its characters
export function startRegex(chars: string[]): string {
	if (chars.length == 0) throw new TypeError("Cannot chain list of no chars");
	return `(${chars.join("")}\s[^${chars[0]}]*)`;
}

// Returns the regex for a surround delimiter from its characters
export function surroundRegex(chars: string[]): string {
	if (chars.length == 0) throw new TypeError("Cannot chain list of no chars");
	const str = chars.join("");
	return `(${str}[^${chars[0]}]*${str})`;
}

// Returns a list of delimiter regexes
export function delimRegexes(
	delims: Delimiter[],
	prepare: Function
): Delimiter[] {
	return delims.map(({ str }) => prepare(escapeChars(str)));
}

// --------------------------- PARSING ---------------------------

// Returns a chat object that describes the chat string
export function parseChat(chatStr: string): Line[] {
	return chatStr.split("\n").map(parseLine);
}

// Returns a line object that describes the line string
export function parseLine(lineStr: string): Line {
	switch (lineStr[0]) {
		case ">":
			return new Line(LineType.MESSAGE, parseMessage(lineStr.substr(1)));
		case "<":
			return new Line(LineType.META, parseMeta(lineStr.substr(1)));
		default:
			throw TypeError("Line must be a message or meta line");
	}
}

// Returns a message object that describes the message string
export function parseMessage(messageStr: string): Message {
	const splitMessage = messageStr.split(messageSplit);
	const userStr = splitMessage[1] || splitMessage[0];
	const bodyStr = splitMessage[2] || "";

	return new Message(userStr, bodyStr === "" ? [] : parseBody(bodyStr));
}

// Returns a meta object that describes the meta string
export function parseMeta(metaStr: string): Meta {
	return new Meta(metaStr);
}

// Returns a body object that describes the body string
export function parseBody(bodyStr: string): Section[] {
	return bodyStr
		.split(new RegExp(delimCombined, "ig"))
		.filter(
			(sectionStr: string) => sectionStr !== undefined && sectionStr !== ""
		)
		.map((sectionStr: string) => {
			const isStartSection = sectionStr[0] !== sectionStr.slice(-1);
			return isStartSection
				? parseStartSection(sectionStr)
				: parseSurroundSection(sectionStr);
		});
}

// Returns a section object that describes the section string
export function parseStartSection(sectionStr: string): Section {
	let section: Section;

	const delim =
		delims.body.start.find(({ str }) => {
			return sectionStr.substr(0, str.length) == str;
		}) || new Delimiter(SectionType.TEXT, "", (str: string) => str);

	section.type = delim.type;
	section.data = delim.parse(sectionStr.substr(delim.str.length));

	return section;
}

// Returns a section object that describes the section string
export function parseSurroundSection(sectionStr: string): Section {
	const s_len = sectionStr.length;
	const delim =
		delims.body.surround.find(({ str }) => {
			const d_len = str.length;

			const l_delim = sectionStr.substr(0, d_len);
			const r_delim = sectionStr.substr(s_len - d_len);

			return l_delim === r_delim && r_delim === str;
		}) || new Delimiter(SectionType.TEXT, "", (str: string) => str);

	const d_len = delim.str.length;
	return new Section(
		delim.type,
		delim.parse(sectionStr.substr(d_len, s_len - 2 * d_len))
	);
}

// Returns a file object that describes the file string
export function parseFile(fileStr: string): FileSection {
	fileStr = fileStr.replace("/", "\\");
	const isFileString = fileStringTest.test(fileStr);
	if (!isFileString) return new FileSection("", "", "");

	// Splits the directory from the file and the filename from the extension
	const pathComponents = fileStr.split(filePathSplit);
	const nameComponents = pathComponents[1].split(fileNameSplit);

	return new FileSection(
		pathComponents[0] || "",
		nameComponents[0] || "",
		nameComponents[1] || ""
	);
}

// Returns a bold object that describes the bold string
export function parseBold(boldStr: string): BoldSection {
	return new BoldSection(boldStr);
}

// Returns a italic object that describes the italic string
export function parseItalic(italicStr: string): ItalicSection {
	return new ItalicSection(italicStr);
}

// Returns a strikethrough object that describes the strikethrough string
export function parseStrikethrough(
	strikethroughStr: string
): StrikeThroughSection {
	return new StrikeThroughSection(strikethroughStr);
}

// Returns a code object that describes the code string
export function parseCode(codeStr: string): CodeSection {
	return new CodeSection(codeStr);
}

// Returns a heading1 object that describes the heading1 string
export function parseHeading1(heading1Str: string): Heading1Section {
	return new Heading1Section(heading1Str);
}

// Returns a heading2 object that describes the heading2 string
export function parseHeading2(heading2Str: string): Heading2Section {
	return new Heading2Section(heading2Str);
}
