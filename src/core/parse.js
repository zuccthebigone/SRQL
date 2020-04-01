// Regexs
const message_split_regex = /^([^:]*):(.*)$/ig

const file_string_test_regex = /[a-z]:\\([^\\\w]*\\)*[^\.]*/i
const file_path_split_regex = /\\([^\\]*$)/ig
const file_name_split_regex = /\.([^\.]*$)/ig

// Delimiters
// MUST ORDER IN DESCENDING STRING LENGTH
const body_delims = {
    surround: [
        {
            string: "~~",
            type: "file",
            parse: parse_file
        },
        {
            string: "*",
            type: "bold",
            parse: parse_bold
        },
        {
            string: "_",
            type: "italic",
            parse: parse_italic
        },
        {
            string: "~",
            type: "strikethrough",
            parse: parse_strikethrough
        },
        {
            string: "`",
            type: "code",
            parse: parse_code
        }
    ],
    start: [
        {
            string: "#",
            type: "heading",
            parse: parse_heading
        }
    ]
};

// Used to split surround sections
const delim_surround_regex = regex_chain_surround_delims(body_delims.surround);
    
function regex_chain_surround_delims(surround_delims) {
    let surround_delims_regex = "";
    surround_delims.forEach(({ string }) => {

        let escaped_delim_chars = [];
        for (let i = 0; i < string.length; i++) {
            const char = string[i];
            escaped_delim_chars.push("\\" + char);
        }
        const escaped_delim = escaped_delim_chars.join("");

        surround_delims_regex += `(${escaped_delim}[^${escaped_delim_chars[0]}]*${escaped_delim})|`
    });
    return surround_delims_regex.substr(0, surround_delims_regex.length - 1);
}

// Returns a list describing the chat contents
function parse_chat(chat_string) {
    let chat = [];
    chat_string.split("\n").forEach(line_string => {
        if (line_string === "") return;
        chat.push(parse_line(line_string));
    });

    return chat;
}

// Returns a line object that describes the line string
function parse_line(line_string) {
    let line = {};

    const delim = line_string[0];
    switch(delim) {
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

    const split_message = message_string.split(message_split_regex);
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
    let body = [];

    const sections = body_string.split(new RegExp(delim_surround_regex, "ig"));
    sections.forEach(section_string => {
        if (section_string === undefined || section_string.length == 0) return;
        const is_start_section = section_string[0] != section_string[section_string.length - 1];
        body.push(is_start_section ? parse_start_section(section_string) : parse_surround_section(section_string));
    });

    return body;
}

// Returns a section object that describes the section string
function parse_start_section(section_string) {
    let section = {};

    const delim = body_delims.start.find(({ string }) => {
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
    const delim = body_delims.surround.find(({ string }) => {

        const d_len = string.length;

        const l_delim = section_string.substr(0, d_len);
        const r_delim = section_string.substr(s_len - d_len);

        return l_delim == r_delim && r_delim == string;
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
    const is_file_string = file_string_test_regex.test(file_string);
    if (!is_file_string) {
        file.dir = "";
        file.name = "";
        file.ext = "";
        return file;
    }
    
    // Splits the directory from the file and the filename from the extension
    const path_components = file_string.split(file_path_split_regex);
    const name_components = path_components[1].split(file_name_split_regex);

    file.dir = path_components[0] || "";
    file.name = name_components[0] || "";
    file.ext = name_components[1] || "";

    return file;
}

function parse_bold(bold_string) {
    bold = {};

    bold.data = bold_string;

    return bold;
}

function parse_italic(italic_string) {
    italic = {};

    italic.data = italic_string;

    return italic;
}

function parse_strikethrough(strikethrough_string) {
    strikethrough = {};

    strikethrough.data = strikethrough_string;

    return strikethrough;
}

function parse_code(code_string) {
    code = {};

    code.data = code_string;

    return code;
}

function parse_heading(heading_string) {
    heading = {};

    heading.data = heading_string;

    return heading;
}

module.exports = {
    parse_chat,
    parse_line
};