// https://mochajs.org/
const assert = require("assert");
const rewire = require("rewire");

// Used to inform tests of unexposed module functions
var parse = rewire("../src/core/parse.js");

describe("parse.js", function() {

    const regex_chain_surround_delims = parse.__get__("regex_chain_surround_delims");

    describe("#regex_chain_surround_delims", function() {
        it("Handles empty list", function() {
            assert.equal(regex_chain_surround_delims([]), "");
        });

        it("Handles single file delimiter '~~'", function () {
            assert.equal(regex_chain_surround_delims([{ string: "~~", type: "file", parse: string => string }]), "(\\~\\~[^\\~]*\\~\\~)");
        });

        it("Handles single strikethrough delimiter '~'", function () {
            assert.equal(regex_chain_surround_delims([{ string: "~", type: "strikethrough", parse: string => string }]), "(\\~[^\\~]*\\~)");
        });

        it("Handles two delimiters '~' and '~~'", function () {
            assert.equal(regex_chain_surround_delims([{ string: "~", type: "strikethrough", parse: string => string }, { string: "~~", type: "file", parse: string => string }]), "(\\~[^\\~]*\\~)|(\\~\\~[^\\~]*\\~\\~)");
        });
    });

    const parse_chat = parse.__get__("parse_chat");

    describe("#parse_chat", function() {
        it("Handles empty string", function() {
            assert.deepEqual(parse_chat(""), []);
        });

        it("Handles one empty message line sent by local user", function () {
            assert.deepEqual(parse_chat(">:"), [{ type: "message", message: { username: "", body: [] } }]);
        });
    });

    const parse_line = parse.__get__("parse_line");

    describe("#parse_line", function() {
        it("Handles empty string: ''", function() {
            assert.deepEqual(parse_line(""), { type: "unknown", data: "" });
        });

        it("Handles empty message line: '>'", function () {
            assert.deepEqual(parse_line(">"), { type: "message", message: { username: "", body: [] } });
        });

        it("Handles message line of one character: '>a'", function () {
            assert.deepEqual(parse_line(">a"), { type: "message", message: { username: "a", body: [] } });
        });

        it("Handles empty meta line: '<'", function () {
            assert.deepEqual(parse_line("<"), { type: "meta", meta: { data: "" } });
        });

        it("Handles meta line of one character: '<a'", function () {
            assert.deepEqual(parse_line("<a"), { type: "meta", meta: { data: "a" } });
        });
    });

    const parse_message = parse.__get__("parse_message");

    describe("#parse_message", function() {
        it("Handles empty string: ''", function() {
            assert.deepEqual(parse_message(""), { username: "", body: [] });
        });

        it("Handles empty message sent by local user: ':'", function () {
            assert.deepEqual(parse_message(":"), { username: "", body: [] });
        });

        it("Handles empty message sent by another user: 'a:'", function () {
            assert.deepEqual(parse_message("a:"), { username: "a", body: [] });
        });

        it("Handles message of one character sent by local user: ':a'", function () {
            assert.deepEqual(parse_message(":a"), { username: "", body: [{ type: "text", data: "a" }] });
        });
    });

    const parse_meta = parse.__get__("parse_meta");

    describe("#parse_meta", function () {
        it("Handles empty string: ''", function () {
            assert.deepEqual(parse_meta(""), { data: "" });
        });

        it("Handles meta of one character: 'a'", function () {
            assert.deepEqual(parse_meta("a"), { data: "a" });
        });
    });

    const parse_body = parse.__get__("parse_body");

    describe("#parse_body", function() {
        it("Handles empty string: ''", function() {
            assert.deepEqual(parse_body(""), []);
        });

        it("Handles body of one text section: 'a'", function () {
            assert.deepEqual(parse_body("a"), [{ type: "text", data: "a" }]);
        });

        it("Handles body of one text section and one file section: 'a~~A:\\a.a~~'", function() {
            assert.deepEqual(parse_body("a~~A:\\a.a~~"), [{ type: "text", data: "a" }, { type: "file", data: { dir: "A:", name: "a", ext: "a" } }]);
        });
    });

    const parse_surround_section = parse.__get__("parse_surround_section");

    describe("#parse_surround_section", function() {
        it("Handles empty string: ''", function() {
            assert.deepEqual(parse_surround_section(""), { type: "text", data: "" });
        });

        it("Handles file surround section: '~~A:\\a.a~~'", function() {
            assert.deepEqual(parse_surround_section("~~A:\\a.a~~"), { type: "file", data: { dir: "A:", name: "a", ext: "a" } });
        });

        it("Handles nested surround section: '_*a*_'", function() {
            assert.deepEqual(parse_surround_section("_*a*_"), { type: "italic", data: { data: "*a*" } });
        });
    });

    const parse_file = parse.__get__("parse_file");

    describe("#parse_file", function() {
        it("Handles empty string: ''", function() {
            assert.deepEqual(parse_file(""), { dir: "", name: "", ext: "" });
        });

        it("Handles forward slashes: 'A:/a.a'", function() {
            assert.deepEqual(parse_file("A:/a.a"), { dir: "A:", name: "a", ext: "a" });
        });

        it("Handles '.'s in folder name: 'A:\\a.\\.a\\.\\a.a'", function () {
            assert.deepEqual(parse_file("A:\\a.\\.a\\.\\a.a"), { dir: "A:\\a.\\.a\\.", name: "a", ext: "a" });
        });

        it("Handles incorrect path format: 'a\\a.a'", function () {
            assert.deepEqual(parse_file("a\\a.a"), { dir: "", name: "", ext: "" });
        });

        it("Handles folder: 'A:\\a'", function () {
            assert.deepEqual(parse_file("A:\\a"), { dir: "A:", name: "a", ext: "" });
        });
    })
});
