
// --------------------------- DELIMITERS ---------------------------

const delims = {
    body: {
        start: [
            {
                type: "heading1",
                string: "#",
                parse: parse_heading1,
            },
            {
                type: "heading2",
                string: "##",
                parse: parse_heading2,
            },
        ],
        surround: [
            {
                type: "file",
                string: "~~",
                parse: parse_file,
            },
            {
                type: "bold",
                string: "*",
                parse: parse_bold,
            },
            {
                type: "italic",
                string: "_",
                parse: parse_italic,
            },
            {
                type: "strikethrough",
                string: "~",
                parse: parse_strikethrough,
            },
            {
                type: "code",
                string: "`",
                parse: parse_code,
            },
        ],
    },
};

// --------------------------- REGEXES ---------------------------

const regex = {
    message_split: /^([^:]*):(.*)$/ig,
    file_string_test: /[a-z]:\\([^\\\w]*\\)*[^\.]*/i,
    file_path_split: /\\([^\\]*$)/ig,
    file_name_split: /\.([^\.]*$)/ig,
    delims_start: delim_regexs(delims.body.surround, start_regex),
    delims_surround: delim_regexs(delims.body.surround, surround_regex),
};

regex.delim_start = regex.delims_start.join("|");
regex.delim_surround = regex.delims_surround.join("|");
regex.delim_combined = `${regex.delim_start}|${regex.delim_surround}`;

// Returns a list of escaped string characters
function escape_chars(string) {
    return string.split("").map(char => "\\" + char);
}

// Returns the regex for a start delimiter from its characters
function start_regex(char_list) {
    if (char_list.length == 0) throw new TypeError("Cannot chain list of no chars");
    return `(${char_list.join("")}\s[^${char_list[0]}]*)`;
}

// Returns the regex for a surround delimiter from its characters
function surround_regex(char_list) {
    if (char_list.length == 0) throw new TypeError("Cannot chain list of no chars");
    string = char_list.join("");
    return `(${string}[^${char_list[0]}]*${string})`;
}

// Returns a list of delimiter regexes
function delim_regexs(delims, prepare) {
    return delims.map(({ string }) => prepare(escape_chars(string)));
}

// --------------------------- PARSING ---------------------------

// Returns a chat object that describes the chat string
function parse_chat(chat_string) {
    return chat_string.split("\n").map(parse_line);
}

// Returns a line object that describes the line string
function parse_line(line_string) {
    let line = {};

    const delim = line_string[0];
    switch (delim) {
        case ">":
            line.type = "message";
            line.message = parse_message(line_string.substr(1));
            break;
        case "<":
            line.type = "meta";
            line.meta = parse_meta(line_string.substr(1));
            break;
        default:
            line.type = "unknown";
            line.data = line_string;
    }

    return line;
}

// Returns a message object that describes the message string
function parse_message(message_string) {
    let message = {};

    const split_message = message_string.split(regex.message_split);
    const user_string = split_message[1] || split_message[0];
    const body_string = split_message[2] || "";

    message.username = user_string;
    message.body = body_string === "" ? [] : parse_body(body_string);

    return message;
}

// Returns a meta object that describes the meta string
function parse_meta(meta_string) {
    let meta = {};

    // TODO: split meta into sections and parse them
    meta.data = meta_string;

    return meta;
}

// Returns a body object that describes the body string
function parse_body(body_string) {
    return body_string.split(new RegExp(regex.delim_combined, "ig"))
        .filter(section_string => section_string !== undefined && section_string !== "")
        .map(section_string => {
            const is_start_section = section_string[0] !== section_string[section_string.length - 1];
            return is_start_section ? parse_start_section(section_string) : parse_surround_section(section_string);
        });
}

// Returns a section object that describes the section string
function parse_start_section(section_string) {
    let section = {};

    const delim = delims.body.start.find(({ string }) => {
        return section_string.substr(0, string.length) == string;
    }) || {
        string: "",
        type: "text",
        data: section_string,
        parse: string => string
    };

    section.type = delim.type;
    section.data = delim.parse(section_string.substr(delim.string.length));

    return section;
}

// Returns a section object that describes the section string
function parse_surround_section(section_string) {
    let section = {};

    const s_len = section_string.length;
    const delim = delims.body.surround.find(({ string }) => {

        const d_len = string.length;

        const l_delim = section_string.substr(0, d_len);
        const r_delim = section_string.substr(s_len - d_len);

        return l_delim === r_delim && r_delim === string;
    }) || {
        string: "",
        type: "text",
        data: section_string,
        parse: string => string
    };

    const d_len = delim.string.length;
    section.type = delim.type;
    section.data = delim.parse(section_string.substr(d_len, s_len - 2 * d_len));

    return section;
}

// Returns a file object that describes the file string
function parse_file(file_string) {
    let file = {};

    file_string = file_string.replace("\/", "\\");
    const is_file_string = regex.file_string_test.test(file_string);
    if (!is_file_string) {
        file.dir = "";
        file.name = "";
        file.ext = "";
        return file;
    }

    // Splits the directory from the file and the filename from the extension
    const path_components = file_string.split(regex.file_path_split);
    const name_components = path_components[1].split(regex.file_name_split);

    file.dir = path_components[0] || "";
    file.name = name_components[0] || "";
    file.ext = name_components[1] || "";

    return file;
}

// Returns a bold object that describes the bold string
function parse_bold(bold_string) {
    bold = {};

    bold.data = bold_string;

    return bold;
}

// Returns a italic object that describes the italic string
function parse_italic(italic_string) {
    italic = {};

    italic.data = italic_string;

    return italic;
}

// Returns a strikethrough object that describes the strikethrough string
function parse_strikethrough(strikethrough_string) {
    strikethrough = {};

    strikethrough.data = strikethrough_string;

    return strikethrough;
}

// Returns a code object that describes the code string
function parse_code(code_string) {
    code = {};

    code.data = code_string;

    return code;
}

// Returns a heading1 object that describes the heading1 string
function parse_heading1(heading1_string) {
    heading1 = {};

    heading1.data = heading1_string;

    return heading1;
}

// Returns a heading2 object that describes the heading2 string
function parse_heading2(heading2_string) {
    heading2 = {};

    heading2.data = heading2_string;

    return heading2;
}

module.exports = {
    parse_chat,
    parse_line,
};
