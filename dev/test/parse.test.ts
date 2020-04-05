// https://mochajs.org/
import { deepEqual, throws } from "assert";
import {
	LineType,
	Line,
	Message,
	Meta,
	SectionType,
	Section,
	FileSection,
	Delimiter,
	escapeChars,
	startRegex,
	surroundRegex,
	delimRegexes,
	parseLine,
	parseMessage,
	parseMeta,
	parseBody,
	parseSurroundSection,
	parseFile,
	ItalicSection,
} from "../src/core/parse";

describe("parse.js", function () {
	describe("#escapeChars", function () {
		it("Handles empty string: ''", function () {
			deepEqual(escapeChars(""), []);
		});

		it("Handles length 1 delimiter '~'", function () {
			deepEqual(escapeChars("~"), ["\\~"]);
		});

		it("Handles length >1 delimiter: '~~'", function () {
			deepEqual(escapeChars("~~"), ["\\~", "\\~"]);
		});
	});

	describe("#startRegex", function () {
		it("Throws TypeError on empty list: []", function () {
			throws(() => {
				startRegex([]);
			}, TypeError);
		});

		it(`Handles length 1 list of escaped delimiter char: ${[
			"\\#",
		]}`, function () {
			deepEqual(startRegex(["\\#"]), "(\\#s[^\\#]*)");
		});

		it(`Handles length >1 list of escaped delimiter chars: ${[
			"\\#",
			"\\#",
		]}`, function () {
			deepEqual(startRegex(["\\#", "\\#"]), "(\\#\\#s[^\\#]*)");
		});
	});

	describe("#surroundRegex", function () {
		it("Throws TypeError on empty list: []", function () {
			throws(() => {
				surroundRegex([]);
			}, TypeError);
		});

		it(`Handles length 1 list of escaped delimiter char: ${[
			"\\~",
		]}`, function () {
			deepEqual(surroundRegex(["\\~"]), "(\\~[^\\~]*\\~)");
		});

		it(`Handles length >1 list of escaped delimiter chars: ${[
			"\\~",
			"\\~",
		]}`, function () {
			deepEqual(surroundRegex(["\\~", "\\~"]), "(\\~\\~[^\\~]*\\~\\~)");
		});
	});

	describe("#delimRegexes", function () {
		it("Handles empty list: []", function () {
			deepEqual(
				delimRegexes([], (str: string) => str),
				[]
			);
		});

		it(`Handles length 1 list of start delimiter and start delimiter chainer: ${[
			{ type: "heading1", string: "#" },
		]}`, function () {
			deepEqual(
				delimRegexes(
					[new Delimiter(SectionType.HEADING1, "#", (str: string) => str)],
					startRegex
				),
				["(\\#s[^\\#]*)"]
			);
		});

		it(`Handles length >1 list of start delimiters and start delimiter chainer: ${[
			new Delimiter(SectionType.HEADING1, "#", (str: string) => str),
			new Delimiter(SectionType.HEADING2, "##", (str: string) => str),
		]}`, function () {
			deepEqual(
				delimRegexes(
					[
						new Delimiter(SectionType.HEADING1, "#", (str: string) => str),
						new Delimiter(SectionType.HEADING2, "##", (str: string) => str),
					],
					startRegex
				),
				["(\\#s[^\\#]*)", "(\\#\\#s[^\\#]*)"]
			);
		});

		it(`Handles length 1 list of surround delimiter and surround delimiter chainer: ${[
			{ type: "file", string: "~" },
		]}`, function () {
			deepEqual(
				delimRegexes(
					[new Delimiter(SectionType.FILE, "~~", (str: string) => str)],
					surroundRegex
				),
				["(\\~\\~[^\\~]*\\~\\~)"]
			);
		});

		it(`Handles length >1 list of surround delimiters and surround delimiter chainer: ${[
			new Delimiter(SectionType.FILE, "~~", (str: string) => str),
			new Delimiter(SectionType.BOLD, "*", (str: string) => str),
		]}`, function () {
			deepEqual(
				delimRegexes(
					[
						new Delimiter(SectionType.FILE, "~~", (str: string) => str),
						new Delimiter(SectionType.BOLD, "*", (str: string) => str),
					],
					surroundRegex
				),
				["(\\~\\~[^\\~]*\\~\\~)", "(\\*[^\\*]*\\*)"]
			);
		});
	});

	describe("#parseLine", function () {
		it("Handles empty string: ''", function () {
			throws(() => {
				parseLine("");
			}, TypeError);
		});

		it("Handles empty message line: '>'", function () {
			deepEqual(
				parseLine(">"),
				new Line(LineType.MESSAGE, new Message("", []))
			);
		});

		it("Handles message line of one character: '>a'", function () {
			deepEqual(
				parseLine(">a"),
				new Line(LineType.MESSAGE, new Message("a", []))
			);
		});

		it("Handles empty meta line: '<'", function () {
			deepEqual(parseLine("<"), new Line(LineType.META, new Meta("")));
		});

		it("Handles meta line of one character: '<a'", function () {
			deepEqual(parseLine("<a"), new Line(LineType.META, new Meta("a")));
		});
	});

	describe("#parseMessage", function () {
		it("Handles empty string: ''", function () {
			deepEqual(parseMessage(""), new Message("", []));
		});

		it("Handles empty message sent by local user: ':'", function () {
			deepEqual(parseMessage(":"), new Message("", []));
		});

		it("Handles empty message sent by another user: 'a:'", function () {
			deepEqual(parseMessage("a:"), new Message("a", []));
		});

		it("Handles message of one character sent by local user: ':a'", function () {
			deepEqual(
				parseMessage(":a"),
				new Message("", [new Section(SectionType.TEXT, "a")])
			);
		});
	});

	describe("#parseMeta", function () {
		it("Handles empty string: ''", function () {
			deepEqual(parseMeta(""), new Meta(""));
		});

		it("Handles meta of one character: 'a'", function () {
			deepEqual(parseMeta("a"), new Meta("a"));
		});
	});

	describe("#parseBody", function () {
		it("Handles empty string: ''", function () {
			deepEqual(parseBody(""), []);
		});

		it("Handles body of one text section: 'a'", function () {
			deepEqual(parseBody("a"), [new Section(SectionType.TEXT, "a")]);
		});

		it("Handles body of one text section and one file section: 'a~~A:\\a.a~~'", function () {
			deepEqual(parseBody("a~~A:\\a.a~~"), [
				new Section(SectionType.TEXT, "a"),
				new Section(SectionType.FILE, new FileSection("A:", "a", "a")),
			]);
		});
	});

	describe("#parseSurroundSection", function () {
		it("Handles empty string: ''", function () {
			deepEqual(parseSurroundSection(""), new Section(SectionType.TEXT, ""));
		});

		it("Handles simple surround section: '~~A:\\a.a~~'", function () {
			deepEqual(
				parseSurroundSection("~~A:\\a.a~~"),
				new Section(SectionType.FILE, new FileSection("A:", "a", "a"))
			);
		});

		it("Handles nested surround section: '_*a*_'", function () {
			deepEqual(
				parseSurroundSection("_*a*_"),
				new Section(SectionType.ITALIC, new ItalicSection("*a*"))
			);
		});
	});

	describe("#parseFile", function () {
		it("Handles empty string: ''", function () {
			deepEqual(parseFile(""), new FileSection("", "", ""));
		});

		it("Handles forward slashes: 'A:/a.a'", function () {
			deepEqual(parseFile("A:/a.a"), new FileSection("A:", "a", "a"));
		});

		it("Handles '.'s in folder name: 'A:\\a.\\.a\\.\\a.a'", function () {
			deepEqual(
				parseFile("A:\\a.\\.a\\.\\a.a"),
				new FileSection("A:\\a.\\.a\\.", "a", "a")
			);
		});

		it("Handles incorrect path format: 'a\\a.a'", function () {
			deepEqual(parseFile("a\\a.a"), new FileSection("", "", ""));
		});

		it("Handles folder: 'A:\\a'", function () {
			deepEqual(parseFile("A:\\a"), new FileSection("A:", "a", ""));
		});
	});
});
