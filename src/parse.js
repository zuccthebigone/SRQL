// Regexs
var message_split_regex = /([^:]*):(.*)/ig

var file_string_test_regex = /[a-z]:\\([^\\\w]*\\)*[^\.]*/i
var file_path_split_regex = /\\([^\\]*$)/ig
var file_name_split_regex = /\.([^\.]*$)/ig

class ChatParser {
    
    constructor() {

        // Delimiters
        // MUST ORDER IN DESCENDING STRING LENGTH
        this.body_delims = {
            surround: [
                {
                    string: "~~",
                    type: "file",
                    parse: this.parse_file
                },
                {
                    string: "*",
                    type: "bold",
                    parse: this.parse_bold
                },
                {
                    string: "_",
                    type: "italic",
                    parse: this.parse_italic
                },
                {
                    string: "~",
                    type: "strikethrough",
                    parse: this.parse_strikethrough
                },
                {
                    string: "`",
                    type: "code",
                    parse: this.parse_code
                }
            ],
            start: [
                {
                    string: "#",
                    type: "heading",
                    parse: this.parse_heading
                }
            ]
        };

        // Used to split surround sections
        this.delim_surround_regex = this.regex_chain_surround_delims(this.body_delims.surround);
    }
    
    regex_chain_surround_delims(surround_delims) {
        let surround_delims_regex = "";
        surround_delims.forEach(({ string }) => {
    
            let escaped_delim_chars = [];
            for (let i = 0; i < string.length; i++) {
                const char = string[i];
                escaped_delim_chars.push("\\" + char);
            }
            let escaped_delim = escaped_delim_chars.join("");
    
            surround_delims_regex += `(${escaped_delim}[^${escaped_delim_chars[0]}]*${escaped_delim})|`
        });
        return surround_delims_regex.substr(0, surround_delims_regex.length - 1);
    }

    // Returns a chat object describing the chat contents
    parse_chat(chat_string) {
        let chat = [];

        chat_string.split("\n").forEach(line_string => {
            chat.push(this.parse_line(line_string));
        });

        return chat;
    }

    parse_line(line_string) {
        let line = {};

        let delim = line_string[0];
        switch(delim) {
            case ">":
                line.type = "message";
                line.data = this.parse_message(line_string.substr(1));
                break;
            case "<":
                line.type = "meta";
                line.data = this.parse_meta(line_string.substr(1));
                break;
            default:
                line.type = "unknown";
                line.data = {};
        }

        return line;
    }

    parse_message(message_string) {
        let message = {};

        let split_message = message_string.split(message_split_regex);
        let user_string = split_message[1];
        let body_string = split_message[2];

        message.username = user_string.length == 0 ? username: user_string;
        message.body = this.parse_body(body_string);

        return message;
    }

    parse_meta(meta_string) {
        let meta = {};

        // TODO: split meta into sections and parse them
        meta.data = meta_string;

        return meta;
    }

    parse_body(body_string) {
        let body = [];

        let sections = body_string.split(new RegExp(this.delim_surround_regex, "ig"));

        sections.forEach(section_string => {
            if (section_string === undefined || section_string.length == 0) return;
            let is_start_section = section_string[0] != section_string[section_string.length - 1];
            body.push(is_start_section ? this.parse_start_section(section_string) : this.parse_surround_section(section_string));
        });

        return body;
    }

    parse_start_section(section_string) {
        let section = {};

        let delim_obj = this.body_delims.start.find(({ string }) => {
            return section_string.substr(0, string.length) == string;
        });

        let delim_found = delim_obj !== undefined;
        section.type = delim_found ? delim_obj.type : "text";
        section.data = delim_found ? delim_obj.parse(section_string.substr(delim_obj.string.length)) : section_string;

        return section;
    }

    // Returns a section object representing the section string
    parse_surround_section(section_string) {
        let section = {};

        let s_len = section_string.length;
        let delim = this.body_delims.surround.find(({ string }) => {

            let d_len = string.length;

            let l_delim = section_string.substr(0, d_len);
            let r_delim = section_string.substr(s_len - d_len);

            return l_delim == r_delim && r_delim == string;
        }) ?? {
            string: "",
            type: "text",
            data: section_string,
            parse: (text_string) => {
                return text_string;
            }
        };

        let d_len = delim.string.length;
        section.type = delim.type;
        section.data = delim.parse(section_string.substr(d_len, s_len - 2 * d_len));

        return section;
    }

    // Returns a file object representing the file string
    parse_file(file_string) {
        let file = {};

        let is_file_string = file_string_test_regex.test(file_string);
        
        if (!is_file_string) {
            file.dir = null;
            file.name = null;
            file.ext = null;
            return file;
        }
        
        // Splits the directory from the file and the filename from the extension
        let path_components = file_string.split(file_path_split_regex);
        let name_components = path_components[1].split(file_name_split_regex);

        file.dir = path_components[0];
        file.name = name_components[0];
        file.ext = name_components[1];

        return file;
    }
}

module.exports = {
    ChatParser
};