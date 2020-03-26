var delim_group_type = { prefix, infix, suffix, surrounder };

class DeliminatorGroup {

    prefix_fragment(escaped_delim_chars, escaped_delim) {
        return `(${escaped_delim}\\\B*)`;
    }
    
    infix_fragment(escaped_delim_chars, escaped_delim) {
        return `(${escaped_delim}[^${escaped_delim_chars[0]}]*)`
    }
    
    suffix_fragment(escaped_delim_chars, escaped_delim) {
        return ``;
    }
    
    surrounder_fragment(escaped_delim_chars, escaped_delim) {
        return `(${escaped_delim}[^${escaped_delim_chars[0]}]*${escaped_delim})`;
    }
    
    construct_escaped_regex(regex_fragment) {
        this.delims.forEach(delim_obj => {
            let delim = delim_obj.delim;
            let escaped_delim_chars = [];
            for (let i = 0; i < delim.length; i++) {
                const char = delim[i];
                escaped_delim_chars.push(`\\\\\\` + char);
            }
            let escaped_delim = escaped_delim_chars.join("");
            this.regex += regex_fragment(escaped_delim_chars, escaped_delim)+"|";
        });
        this.regex = escaped_regex.substr(0, escaped_regex.length - 2);
    }
    
    construct_regex() {
        switch (this.type) {
            case delim_group_type.prefix:
                this.construct_escaped_regex(this.prefix_fragment);
                break;
            case delim_group_type.infix:
                this.construct_escaped_regex(this.infix_fragment);
                break;
            case delim_group_type.suffix:
                this.construct_escaped_regex(this.suffix_fragment);
                break;
            case delim_group_type.surrounder:
                this.construct_escaped_regex(this.surrounder_fragment);
                break;
        }
    }

    // Set up deliminator objects and deliminator group regex
    constructor(delims, type) {
        this.delims = delims;
        this.type = type;
        this.regex = "";
        this.construct_regex();
    }

    // Returns the appropriate object
    parse(string) {
        switch (this.type) {
            case delim_group_type.prefix:
                this.parse_prefix(string);
                break;
            case delim_group_type.infix:
                this.parse_infix(string);
                break;
            case delim_group_type.suffix:
                this.parse_suffix(string);
                break;
            case delim_group_type.surrounder:
                this.parse_surrounder(string);
                break;
            default:
                break;
        }
    }

    parse_prefix(string) {
        this.delims.forEach(delim_obj => {
            string.split(new RegExp(this.regex, "ig"));
        })
        return 
    }

    parse_infix(string) {

    }

    parse_suffix(string) {

    }

    parse_surrounder(string) {

    }
}

class ChatParser {

    // Sets up parsing strings and parsing-metadata
    constructor() {

        // Valid username
        this.username_regex = "[a-z0-9\-_]*";

        // Valid file path
        this.file_path_regex = "\\\^[a-z]:\\\\(?:[a-z0-9_\\\-\\\s]*\\\\)*[a-z0-9_\\\-\\\s]*.(?:js|txt|py)\\\^";

        // Line deliminators, their types and parsers
        let line_delims = [
            {
                delim: ">",
                type: "message",
                parser: this.parse_message
            },
            {
                delim: "<",
                type: "meta",
                parser: this.parse_meta
            }
        ];
        this.line_delim_group = new DeliminatorGroup(line_delims, delim_group_type.prefix);

        // Message deliminators, their types and parsers
        let body_delims = [
            {
                delim: "~~",
                type: "file",
                parser: this.parse_file
            }
        ];
        this.body_delim_group = new DeliminatorGroup(body_delims, delim_group_type.surrounder);
    }

    // Returns a chat object describing the chat contents
    parse_chat(chat_string) {
        let chat = [];

        chat_string.split("\n").forEach(line_string => {
            this.line_delim_group.parse(line_string);
        });

        return chat;
    }

    parse_message(message_string) {
        let message = {};

        let matches = message_string.split(/:(.+)/);
        let user_string = matches[0];
        let body_string = matches[1];

        if (user_string.length == 0) {
            message.username = username;
        } else {
            message.username = user_string;
        }

        message.body = this.parse_body(body_string);

        return message;
    }

    parse_body(body_string) {
        let body = [];

        regex_string = "";
        let sections = body_string.split(new RegExp(this.delim_regex_string, "ig"));
        sections.forEach(section_string => {
            if (section_string.length == 0) continue;
            body.push(this.parse_section(section_string));
        });

        return message;
    }

    parse_section(section_string) {
        let section = {};

        for (let i = 0; i < section_string.length; i++) {
            const char = section_string[i];

        }

        let delim = "";
        if (delim_start == delim_end) {
            delim = delim_start;
        }

        switch (delim) {

        }

        return section;
    }

    parse_file(file_string) {
        let file = {};


        section_string = section_string.substr(1, section_string.length - 2);

        if (/[a-z]:\\(?:[a-z0-9_\-\s\.]*\\)*[a-z0-9_\-\s\.]*.(?:js|txt|py)/i.test(section_string)) {
            section.type = "file";
            section.data = this.file(section_string);
        }

        file.path = file_string;
        let split_file_string = file_string.split(new RegExp("\\\.", "ig"));
        file.type = split_file_string[split_file_string.length - 1];

        return file;
    }
}