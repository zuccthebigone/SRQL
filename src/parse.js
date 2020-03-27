class ChatParser {

    // Sets up parsing strings and parsing-metadata
    constructor() {

        // Valid username
        this.username_regex = "[a-z0-9\-_]*";

        // Valid file path
        this.file_path_regex = "\\\^[a-z]:\\\\(?:[a-z0-9_\\\-\\\s]*\\\\)*[a-z0-9_\\\-\\\s]*.(?:js|txt|py)\\\^";

        this.body_delims = {
            surround: [
                {
                    delim: "~~",
                    type: "file",
                    parse: this.parse_file
                },
                {
                    delim: "*",
                    type: "bold",
                    parse: this.parse_bold
                },
                {
                    delim: "_",
                    type: "italic",
                    parse: this.parse_italic
                },
                {
                    delim: "~",
                    type: "strikethrough",
                    parse: this.parse_strikethrough
                },
                {
                    delim: "`",
                    type: "code",
                    parse: this.parse_code
                }
            ],
            start: [
                {
                    delim: "#",
                    type: "heading",
                    parse: this.parse_heading
                }
            ]
        };

        this.delim_surround_regex = "";
        this.body_delims.surround.forEach(delim_obj => {

            let delim = delim_obj.delim;

            let escaped_delim_chars = [];
            for (let i = 0; i < delim.length; i++) {
                const char = delim[i];
                escaped_delim_chars.push("\\" + char);
            }

            let escaped_delim = escaped_delim_chars.join("");
            this.delim_surround_regex += `(${escaped_delim}[^${escaped_delim_chars[0]}]*${escaped_delim})|`
        });

        this.delim_surround_regex = this.delim_surround_regex.substr(0, this.delim_surround_regex.length - 1);
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
                line.data = this.parse_message(line_string.substr(1, line_string.length));
                break;
            case "<":
                line.type = "meta";
                line.data = this.parse_meta(line_string.substr(1, line_string.length));
            default:
                line.type = "unknown";
                line.data = {};
        }

        return line;
    }

    parse_message(message_string) {
        let message = {};

        let matches = message_string.split(new RegExp("([^:]*):(.*)", "ig"));
        let user_string = matches[1];
        let body_string = matches[2];

        if (user_string.length == 0) {
            message.username = username;
        } else {
            message.username = user_string;
        }

        message.body = this.parse_body(body_string);

        return message;
    }

    parse_meta(meta_string) {
        let meta = {};

        return meta;
    }

    parse_body(body_string) {
        let body = [];

        let sections = body_string.split(new RegExp(this.delim_surround_regex, "ig"));

        sections.forEach(section_string => {
            if (section_string === undefined) return;
            if (section_string.length == 0) return;
            if (section_string[0] != section_string[section_string.length - 1]) {
                body.push(this.parse_start_section(section_string));
            } else {
                body.push(this.parse_surround_section(section_string));
            }
        });

        return body;
    }

    parse_start_section(section_string) {
        let section = {};

        let delim_obj = this.body_delims.start.find(({ delim }) => {
            return section_string.substr(0, delim.length) == delim;
        });

        if (delim_obj === undefined) {
            section.type = "text";
            section.data = section_string;
        } else {
            section.type = delim_obj.type;
            section.data = delim_obj.parse(section_string.substr(delim_obj.delim.length, section_string.length));
        }

        return section;
    }

    parse_surround_section(section_string) {
        let section = {};

        let section_len = section_string.length;
        let delim_obj = this.body_delims.surround.find(delim_obj => {

            let delim = delim_obj.delim;
            let delim_len = delim.length;

            let left_delim = section_string.substr(0, delim_len);
            let right_delim = section_string.substr(section_len - delim_len, section_len);

            return left_delim == right_delim && right_delim == delim;
        });

        if (delim_obj === undefined) {
            section.type = "text";
            section.data = section_string;
        } else {
            let delim_len = delim_obj.delim.length;
            section.type = delim_obj.type;
            section.data = delim_obj.parse(section_string.substr(delim_len, section_len - 2 * delim_len));
        }

        return section;
    }

    parse_file(file_string) {
        let file = {};

        if (!(/[a-z]:\\([^\\\w]*\\)*[^\.]*/i.test(file_string))) {
            console.log(file_string);
            file.dir = null;
            file.name = null;
            file.ext = null;
            return file;
        }

        let path_components = file_string.split(/\\([^\\]*$)/ig);
        file.dir = path_components[0];
        let name_components = path_components[1].split(/\.([^\.]*$)/ig);
        file.name = name_components[0];
        file.ext = name_components[1];

        return file;
    }
}

module.exports = {
    ChatParser
};