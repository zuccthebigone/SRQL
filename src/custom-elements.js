const { BrowserWindow } = require("electron").remote;
window.$ = window.jQeury = require("jquery");
const get_caret_pos = require("textarea-caret");
const string_compare = require("string-similarity");

class WindowFrame extends HTMLElement {
    constructor() {
        super();

        var opts = document.createElement("button");
        opts.className = "options";
        opts.innerHTML = `<i class="fas fa-cog"></i>`;
        opts.addEventListener("click", event => {
            
        });

        var command = document.createElement("input");
        command.type = "text";
        command.placeholder = "Search or Type Command";
        $(command).focus(() => {
            command.placeholder = "Type / or @ for commands";
        });

        $(command).focusout(() => {
            command.placeholder = "Search or Type Command"
        })

        var minimize = document.createElement("button");
        minimize.innerHTML = `<i class="fas fa-minus"></i>`;
        minimize.addEventListener("click", event => {
            this.window.minimize();
        });

        var restore = document.createElement("button");
        restore.innerHTML = `<i class="far fa-window-maximize"></i>`;
        restore.addEventListener("click", event => {
            if (this.window.isMaximized()) {
                this.window.unmaximize();
            } else {
                this.window.maximize();
            }
        });

        var close = document.createElement("button");
        close.className = "close";
        close.innerHTML = `<i class="fas fa-times"></i>`;
        close.addEventListener("click", event => {
            this.window.close();
        });

        this.appendChild(opts);
        this.appendChild(command);
        this.appendChild(close);
        this.appendChild(restore);
        this.appendChild(minimize);

        window.addEventListener("resize", event => {
            if (this.window.isMaximized()) {
                restore.innerHTML = `<i class="far fa-window-restore"></i>`;
            } else {
                restore.innerHTML = `<i class="far fa-window-maximize"></i>`;
            }
        });
    }

    get window() {
        return BrowserWindow.getFocusedWindow();
    }
}

class PageSelect extends HTMLElement {
    constructor() {
        super();
        var indicator = document.createElement("div");
        indicator.className = "indicator";

        var buttons = $(this).children();
        var pages = [];
        buttons.each((i, elem) => {
            pages.push($(`#${elem.getAttribute("target")}`)[0]);
        });

        buttons.click((event) => {
            var elem = $(event.currentTarget);
            var index = elem.index();
            indicator.style.transform = `translateY(calc(100% * ${index}))`;
            pages.forEach((page) => {
                page.active = false;
            });
            buttons.each((i, btn) => {
                btn.removeAttribute("active");
            });
            elem[0].setAttribute("active", "");
            $(`#${elem[0].getAttribute("target")}`)[0].active = true;
        });

        this.appendChild(indicator);
    }
}

class AppPage extends HTMLElement {
    constructor() {
        super();
        this.active = this.hasAttribute("active");
    }

    get active() {
        return this.hasAttribute("active");
    }

    set active(x) {
        if (x) {
            this.setAttribute("active", "");
        } else {
            this.removeAttribute("active");
        }
    }
}

class TabSelect extends HTMLElement {
    constructor() {
        super();
        var buttons = $(this).children();
        var tabs = [];
        buttons.each((i, elem) => {
            tabs.push($(`#${elem.getAttribute("target")}`)[0]);
        });

        buttons.click((event) => {
            var elem = $(event.currentTarget);
            var index = elem.index();
            tabs.forEach((tab) => {
                tab.active = false;
            });
            buttons.each((i, btn) => {
                btn.removeAttribute("active");
            });
            elem[0].setAttribute("active", "");
            $(`#${elem[0].getAttribute("target")}`)[0].active = true;
        });
    }
}

class AppTab extends AppPage {
    constructor() {
        super();
    }
}

class AppInbox extends HTMLElement {
    constructor() {
        super();

        for (var i = 0; i < 10; i ++) {
            var email = document.createElement("div");
            email.className = "email";

            var user = document.createElement("div");
            user.className = "user";
            user.textContent = "MD";

            var username = document.createElement("div");
            username.className = "username";
            username.textContent = "@zuccthebigone";

            var block = document.createElement("div");
            block.className = "block";

            var message = document.createElement("div");
            message.className = "message";
            message.textContent = "Semper risus in hendrerit gravida rutrum quisque non tellus orci Dictum sit amet justo donec enim diam vulputate ut pharetra Sed viverra ipsum nunc aliquet bibendum enim facilisis gravida neque.";

            email.appendChild(user);
            email.appendChild(username);
            email.appendChild(block);
            email.appendChild(message);

            this.appendChild(email);
        }
    }
}

class SRQLTile extends HTMLElement {
    constructor() {
        super();

        this.name = this.getAttribute("name");
        this.srql_id = this.getAttribute("srql_id");

        var opts_elem = document.createElement("button");
        opts_elem.className = "options";
        opts_elem.innerHTML = `<i class="fas fa-ellipsis-h"></i>`;

        var image_elem = document.createElement("div");
        image_elem.className = "image";
        image_elem.textContent = this.getAttribute("initials");

        if (this.hasAttribute("colour")) {
            image_elem.style.backgroundColor = this.getAttribute("colour");
        }

        var name_elem = document.createElement("div");
        name_elem.className = "title";
        name_elem.textContent = this.getAttribute("name");

        this.appendChild(opts_elem);
        this.appendChild(image_elem);
        this.appendChild(name_elem);

        this.addEventListener("click", () => {
            $("#srqls-container").parent()[0].active = false;
            $("#current-srql")[0].active = true;
            $("#srqls .title")[0].textContent = this.name;
        });
    }
}

class SmartText extends HTMLElement {
    constructor() {
        super();
        this.file_icon = {
            "txt": "fas fa-file-alt",
            "py": "fas fa-file-code",
            "js": "fas fa-file-code",
            "css": "fas fa-file-code",
            "folder": "fas fa-folder",
            "file": "fas fa-file"
        }
        this.chat = {};
        this.load_chat(`<t:\n>p4r17y817:Hello There\n>:Hi\n>:my name is Matthew\n>:~~D:\\Documents\\Github\\SRQL\\src\\utils.js~~ ~~D:\\Documents\\Github\\SRQL\\src\\custom_elements.js~~`);
    }

    load_chat(chat_string) {
        this.innerHTML = "";
        this.chat = parse_chat(chat_string);
        this.render_chat(this.chat);
    }

    render_chat(chat) {
        chat.forEach(line => {
            let line_elem;
            switch (line.type) {
                case "message":
                    line_elem = this.render_message(line.message);
                    break;
                case "meta":
                    line_elem = this.render_meta(line.meta);
                    break;
                case "unknown":
                    line_elem = this.render_unknown(line.data);
                default:
                    return;
            }
            this.appendChild(line_elem);
        });
    }

    render_message(message) {
        let message_elem = document.createElement("span");
        message_elem.className = "message";

        message.body.forEach(section => {
            message_elem.appendChild(this.render_section(section));
        });

        return message_elem;
    }

    render_meta(meta) {
        let meta_elem = document.createElement("span");
        meta_elem.className = "meta";

        return meta_elem;
    }

    render_unknown(data) {
        let unknown_elem = document.createElement("span");
        unknown_elem.className = "unknown";

        return unknown_elem;
    }

    render_section(section) {
        let section_elem;
        switch(section.type) {
            case "text":
                section_elem = this.render_text(section.data);
                break;
            case "file":
                section_elem = this.render_file(section.data);
                break;
            default:
                section_elem = this.render_text(section.data);
        }

        return section_elem;
    }

    render_text(text) {
        let text_elem = document.createElement("div");
        text_elem.className = "text";

        text_elem.textContent = text;

        return text_elem;
    }

    render_file(file) {
        let file_elem = document.createElement("div");
        file_elem.className = "file";

        let icon_elem = document.createElement("i");
        icon_elem.className = "file-icon ";
        let name_elem = document.createElement("div");
        name_elem.className = "file-name";

        const not_file = file.ext === "";
        const file_exists = file.dir !== "" && file.name !== "";
        icon_elem.classList += not_file ? (file_exists ? this.file_icon["file"] : this.file_icon["folder"]) : this.file_icon[file.ext];
        name_elem.textContent = not_file ? (file_exists ? file.dir + "\\" + file.name : "File Not Found") : file.name + "." + file.ext;

        file_elem.appendChild(icon_elem);
        file_elem.appendChild(name_elem);

        return file_elem;
    }

    add_line(line_string) {
        const line = parse_line(line_string);
        this.chat.push(line);
        this.appendChild(render_line(line));
    }
}

class SmartInput extends HTMLElement {
    constructor() {
        super();
        var input_elem = document.createElement("input");
        input_elem.placeholder = "Type message..";

        var indicator_elem = document.createElement("i");
        indicator_elem.className = "fas fa-angle-right";

        var autocomplete_elem = document.createElement("ul");
        autocomplete_elem.className = "autocomplete";

        var keywords = ["abstract", "arguments", "await", "boolean", "break", "byte", "case", "catch", "char", "class", "const", "continue", "debugger", "default", "delete", "do", "double", "else", "enum", "eval", "export", "extends", "false", "final", "finally", "float", "for", "function", "goto", "if", "implements", "import", "in", "instanceof", "int", "interface", "let", "long", "native", "new", "null", "package", "private", "protected", "public", "return", "short", "static", "super", "switch", "synchronized", "this", "throw", "throws", "transient", "true", "try", "typeof", "var", "void", "volatile", "while", "with", "yield"];

        var autocomplete_matches = [];
        var autocomplete_select = null;

        this.appendChild(indicator_elem);
        this.appendChild(input_elem);
        this.appendChild(autocomplete_elem);

        function input() {
            let before_selection = input_elem.value.substr(0, input_elem.selectionStart);
            let after_selection = input_elem.value.substr(input_elem.selectionEnd);

            let word_start = before_selection.split(/(\w*\s*)*([^\s]*$)/ig).filter(string => { return string !== "" })[0] || "";
            let word_end = after_selection.split(/(^[^\s]*)/i).filter(string => { return string !== "" })[0] || "";

            let word = word_start + word_end;

            let matches = string_compare.findBestMatch(word, keywords).ratings.sort((a, b) => (a.rating > b.rating) ? 1 : -1).filter(({ rating }) => { return rating >= 0.1 });

            autocomplete_elem.innerHTML = "";

            autocomplete_matches = [];

            matches.forEach(({ target }) => {
                autocomplete_matches.push(target);
            });

            autocomplete_matches.forEach(match => {
                let word_elem = document.createElement("li");
                word_elem.textContent = match;
                autocomplete_elem.appendChild(word_elem);
            });

            let input_string = input_elem.value;
            let caret_pos = get_caret_pos(input_elem, input_elem.selectionStart);
            autocomplete_elem.style.transform = `translate(${caret_pos.left}px)`;
        }

        this.addEventListener("input", input);

        this.addEventListener("keydown", event => {
            if (event.key == "ArrowUp") {
                event.preventDefault();
                if (autocomplete_select == null) {
                    autocomplete_select = autocomplete_matches.length - 1;
                } else {
                    autocomplete_elem.children[autocomplete_select].className = "";
                    autocomplete_select --;
                }
                if (autocomplete_select < 0) autocomplete_select = autocomplete_matches.length - 1;
                autocomplete_elem.children[autocomplete_select].className = "active";
            } else if (event.key == "ArrowDown") {
                event.preventDefault();
                if (autocomplete_select == null) {
                    autocomplete_select = 0;
                } else {
                    autocomplete_elem.children[autocomplete_select].className = "";
                    autocomplete_select ++;
                }
                autocomplete_select %= autocomplete_matches.length;
                autocomplete_elem.children[autocomplete_select].className = "active";
            } else if (event.key == "Enter" || event.key == "Tab") {
                if (event.key == "Tab") event.preventDefault();
                if (autocomplete_select === null || autocomplete_select < 0) {
                    if (event.key == "Enter") {
                        $("#current-srql smart-text")[0].append_message("\n>:" + input_string);
                        input_elem.value = "";
                        autocomplete_select = null;
                    }
                } else {
                    input_elem.value += autocomplete_matches[autocomplete_select] + " ";
                    autocomplete_elem.children[autocomplete_select].className = "";
                    autocomplete_select = null;
                    input();
                }
            }
        });
    }
}

window.customElements.define("window-frame", WindowFrame);
window.customElements.define("page-select", PageSelect);
window.customElements.define("app-page", AppPage);
window.customElements.define("tab-select", TabSelect);
window.customElements.define("app-tab", AppTab);
window.customElements.define("app-inbox", AppInbox);
window.customElements.define("srql-tile", SRQLTile);
window.customElements.define("smart-text", SmartText);
window.customElements.define("smart-input", SmartInput);