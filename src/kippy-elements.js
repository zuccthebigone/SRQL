const { hash_password, authenticate } = require("./core/security.js");
const { ClientFactory } = require("./core/db.js");
const { Kippy } = require("./core/kippy.js");
const { parse_chat, parse_line } = require("./core/parse.js");
const { Peer } = require("./core/peer.js");
const { BrowserWindow } = require("electron").remote;

const client_factory = new ClientFactory();

class WindowFrame extends Kippy {

    constructor() {
        super(null, "div", "window-frame");
    }

    initialise() {
        this.views = [];

        this.state = {
            authenticated: false,
        };

        this.password = hash_password("password123");

        this.title_bar = new TitleBar(this);
        this.login_box = new LoginBox(this);

        this.srql = new SrqlView(this);
        this.other = new View(this, "Files", "fas fa-archive");
        this.sidebar = new Sidebar(this);


    }

    async authenticate(username, password) {
        const user = await authenticate(username, password);
        this.state.authenticated = user !== null;
        if (this.state.authenticated) {
            this.user_id = user.id;

            this.username = username;
            this.peer = new Peer(this.username);

            this.peer.on("request-data", (data) => {
                this.peer.emit(data.src, "post-data", `>zuccthebigone:Chungus`);
            });
        }
    }
}

class TitleBar extends Kippy {

    constructor(parent) {
        super(parent, "div", "title-bar");
    }

    initialise() {

        this.window = BrowserWindow.getFocusedWindow();

        this.settings = document.createElement("i");
        this.settings.className = "fas fa-cog settings";
        this.appendChild(this.settings);

        this.minimize = document.createElement("button");
        this.minimize.innerHTML = `<i class="fas fa-minus"></i>`;
        this.minimize.addEventListener("click", () => this.window.minimize);

        this.restore = document.createElement("button");
        this.restore.innerHTML = `<i class="far fa-window-maximize"></i>`;
        this.restore.addEventListener("click", () => {
            if (this.window.isMaximized()) {
                this.window.unmaximize();
            } else {
                this.window.maximize();
            }
        });

        this.close = document.createElement("button");
        this.close.className = "close";
        this.close.innerHTML = `<i class="fas fa-times"></i>`;
        this.close.addEventListener("click", () => this.window.close);

        this.appendChild(this.close);
        this.appendChild(this.restore);
        this.appendChild(this.minimize);

        this.srql_search = new SrqlSearch(this);
    }

    update() {
        this.settings.style.display = this.parent.state.authenticated ? null : "none";
        this.srql_search.container.style.display = this.parent.state.authenticated ? null : "none";
    }
}

class SrqlSearch extends Kippy {
    constructor(parent) {
        super(parent, "input", "srql-search");
    }

    initialise() {
        this.state = {
            text: "start"
        };

        this.container.placeholder = "Search or Type Command";

        this.container.addEventListener("input", () => {
            this.state.text = this.container.value;
        });

        this.container.addEventListener("focusin", () => this.container.placeholder = "Type / or @ for commands");
        this.container.addEventListener("focusout", () => this.container.placeholder = "Search or Type Command");

        this.search_suggestion = new SearchSuggestion(this);
    }
}

class SearchSuggestion extends Kippy {
    constructor(parent) {
        super(parent, "div", "search-suggestion");
    }

    initialise() {
        this.state = {
            suggestions: []
        };
    }

    update() {
        this.container.textContent = this.parent.state.text;
    }
}

class LoginBox extends Kippy {
    constructor(parent) {
        super(parent, "div", "login");
    }

    initialise() {
        this.username_input = document.createElement("input");
        this.username_input.placeholder = "username..";
        this.username_input.value = "p4r17y817";

        this.username_input.addEventListener("keypress", (event) => {
            if (event.key == "Enter") {
                this.parent.authenticate(this.username_input.value, this.parent.password);
            }
        });

        this.appendChild(this.username_input);
        this.username_input.focus();
    }

    update() {
        this.container.style.display = this.parent.state.authenticated ? "none" : null;
    }
}

class Sidebar extends Kippy {
    constructor(parent) {
        super(parent, "div", "sidebar");
    }

    initialise() {
        this.previous_view_index = 0;
        this.state = {
            current_view_index: 0
        };

        this.indicator = document.createElement("div");
        this.indicator.className = "indicator";
        this.appendChild(this.indicator);

        this.buttons = [];
        this.parent.views.forEach((view, i) => {
            const button = document.createElement("button");
            button.className = "select-page";

            const icon = document.createElement("i");
            icon.className = view.icon;
            button.appendChild(icon);

            const text = document.createElement("div");
            text.className = "name";
            text.textContent = view.view_name;
            button.appendChild(text);

            button.addEventListener("click", () => {
                this.previous_view_index = this.state.current_view_index;
                this.state.current_view_index = i;
            });

            this.appendChild(button);
            this.buttons.push(button);
        });
    }

    update() {
        this.container.style.display = this.parent.state.authenticated ? null : "none";

        this.buttons[this.previous_view_index].classList.remove("active");
        this.buttons[this.state.current_view_index].classList.add("active");

        this.indicator.style.transform = `translateY(calc(100% * ${this.state.current_view_index}))`;

        this.parent.views[this.previous_view_index].container.classList.remove("active");
        this.parent.views[this.state.current_view_index].container.classList.add("active");
    }
}

class View extends Kippy {
    constructor(parent, name, icon) {
        super(parent, "div", "view");
        this.view_name = name;
        this.icon = icon;
        this.parent.views.push(this);
    }

    initialise() {
        this.views = [];
        this.previous_view_index = 0;
        this.state = {
            current_view_index: 0,
        };
        this.container.textContent = this.view_name;
    }

    update() {
        this.container.style.display = this.parent.state.authenticated ? null : "none";
        if (this.views == null) return;
        if (this.views.length === 0) return;
        this.views[this.previous_view_index].container.classList.remove("active");
        this.views[this.state.current_view_index].container.classList.add("active");
    }
}

class SrqlView extends View {
    constructor(parent) {
        super(parent, "Srqls", "fas fa-user-friends");
    }

    initialise() {
        this.views = [];
        this.previous_view_index = 0;
        this.state = {
            current_view_index: 0,
        };

        this.srql_tiles = new SrqlTiles(this);
        this.current_srql = new ChatView(this);
    }
}

class SrqlTiles extends Kippy {
    constructor(parent) {
        super(parent, "div", "srql-tiles view");
        this.parent.views.push(this);
    }

    initialise() {
        this.srqls = [];
    }

    async update() {
        if (this.root.state.authenticated) {
            this.container.innerHTML = "";
            this.srqls = [];
            const client = await client_factory.new();
            const { rows } = await client.query(`SELECT id FROM srql s INNER JOIN srql_member sm ON s.id=sm.srql_id WHERE sm.user_id=$1::uuid`, [this.root.user_id]);
            rows.forEach(srql => {
                const srql_tile = new SrqlTile(this, srql.id);
                this.srqls.push(srql_tile);
                srql_tile.container.addEventListener("click", () => {
                    this.parent.previous_view_index = this.parent.state.current_view_index;
                    this.parent.state.current_view_index = 1;
                    this.parent.current_srql.state.srql_id = srql.id;
                });
            });
        }
    }
}

class SrqlTile extends Kippy {
    constructor(parent, id) {
        super(parent, "div", "srql-tile view");
        this.state.srql_id = id;
    }

    initialise() {
        this.state = {
            srql_id: null,
        };

        this.options = document.createElement("i");
        this.options.className = "fas fa-ellipsis-h options";

        this.initials = document.createElement("div");
        this.initials.className = "initials";

        this.title = document.createElement("div");
        this.title.className = "title";

        this.owner = document.createElement("div");
        this.owner.className = "owner";

        this.appendChild(this.options);
        this.appendChild(this.initials);
        this.appendChild(this.title);
        this.appendChild(this.owner);
    }

    async update() {
        if (this.state.srql_id === null) return;

        const client = await client_factory.new();

        client.query(`SELECT username FROM public.user u INNER JOIN srql_member sm ON sm.user_id=u.id WHERE sm.srql_id=$1::uuid AND sm.role='owner'`, [this.state.srql_id], (err, { rowCount, rows }) => {
            if (rowCount == 0) return;
            this.owner.textContent = "@" + rows[0].username;
        });

        client.query(`SELECT * FROM srql WHERE id=$1::uuid`, [this.state.srql_id], (err, { rowCount, rows }) => {
            if (rowCount != 0) {
                const srql_name = rows[0].name;
                const srql_initials = srql_name.substr(0, 2);
                this.initials.textContent = srql_initials;
                this.title.textContent = srql_name;
            }
        });
    }
}

class ChatView extends View {
    constructor(parent, srql_id) {
        super(parent);
        this.parent.views.push(this);
    }

    initialise() {
        this.state = {
            srql_id: null,
        };
        this.previous_srql_id = null;

        this.chat = new Chat(this);
        this.input = new ChatInput(this);

        this.back = document.createElement("i");
        this.back.className = "fas fa-arrow-left back";

        this.info_bar = document.createElement("div");
        this.info_bar.className = "info";
        this.appendChild(this.info_bar);

        this.title = document.createElement("div");
        this.title.className = "title";
        this.info_bar.appendChild(this.title);

        this.owner = document.createElement("div");
        this.owner.className = "owner";
        this.info_bar.appendChild(this.owner);

        this.settings = document.createElement("i");
        this.settings.className = "fas fa-wrench settings";
        this.info_bar.appendChild(this.settings);

        this.back.addEventListener("click", () => {
            this.parent.previous_view_index = this.parent.state.current_view_index;
            this.parent.state.current_view_index = 0;
        });
        this.appendChild(this.back);
    }

    async update() {
        if (this.state.srql_id === null || this.state.srql_id === this.previous_srql_id) return;
        this.previous_srql_id = this.state.srql_id;

        const client = await client_factory.new();

        client.query(`SELECT username FROM public.user u INNER JOIN srql_member sm ON sm.user_id=u.id WHERE sm.srql_id=$1::uuid AND sm.role='owner'`, [this.state.srql_id], (err, { rowCount, rows }) => {
            if (rowCount === 0) return;
            const owner = rows[0].username;
            this.root.peer.connect(this.state.srql_id);
            this.owner.textContent = "@" + owner;
        });

        client.query(`SELECT name FROM srql WHERE id=$1::uuid`, [this.state.srql_id], (err, { rowCount, rows }) => {
            if (rowCount == 0) return;
            this.title.textContent = rows[0].name;
        });
    }
}

class Chat extends Kippy {
    constructor(parent) {
        super(parent, "div", "chat");
    }

    initialise() {
        this.file_icon = {
            "txt": "fas fa-file-alt",
            "py": "fas fa-file-code",
            "js": "fas fa-file-code",
            "css": "fas fa-file-code",
            "folder": "fas fa-folder",
            "file": "fas fa-file",
        };

        this.text = `>p4r17y817:Hello There\n>zuccthebigone:Hi\n>zuccthebigone:Check this out: ~~D:\\Documents\\Github\\SRQL\\src\\utils.js~~ and this: ~~D:\\Documents\\Github\\SRQL\\src\\custom_elements.js~~`;
    }

    set text(text) {
        this.container.innerHTML = "";
        this.chat = parse_chat(text);

        this.chat.forEach(line => {
            let line_elem;
            switch (line.type) {
                case "message":
                    line_elem = this.render_message(line.message);
                    break;
                case "meta":
                    line_elem = this.render_meta(line.meta);
                    break;
                default:
                    return;
            }
            this.appendChild(line_elem);
        });

        this.tooltip = document.createElement("div");
        this.tooltip.className = "tooltip";
        this.tooltip.textContent = "tooltip";
        this.appendChild(this.tooltip);
    }

    render_message(message) {
        const message_elem = document.createElement("span");
        message_elem.className = "message";


        if (message.username === this.root.username) {

        } else {
            message_elem.style.borderColor = "#ccceff"; //#ffe7c6

            const user_elem = document.createElement("div");
            user_elem.className = "user";
            user_elem.textContent = "@" + message.username;
            message_elem.appendChild(user_elem);
        }

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

    render_section(section) {
        let section_elem;
        switch (section.type) {
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
        icon_elem.classList += not_file ? (file_exists ? this.file_icon.file : this.file_icon.folder) : this.file_icon[file.ext];
        name_elem.textContent = not_file ? (file_exists ? file.dir + "\\" + file.name : "File Not Found") : file.name + "." + file.ext;

        file_elem.appendChild(icon_elem);
        file_elem.appendChild(name_elem);

        file_elem.addEventListener("mouseenter", (event) => {
            this.tooltip.textContent = file.dir + "\\" + file.name + "." + file.ext;
            this.tooltip.style.left = file_elem.offsetLeft + file_elem.offsetWidth / 2 - this.tooltip.offsetWidth / 2 + "px";
            this.tooltip.style.top = file_elem.offsetTop - this.tooltip.clientHeight - 5 + "px";
            this.tooltip.style.opacity = 1;
        });

        file_elem.addEventListener("mouseleave", () => this.tooltip.style.opacity = 0);

        return file_elem;
    }

    add_line(line_string) {
        const line = parse_line(line_string);
        this.chat.push(line);
        this.appendChild(this.render_message(line.message));
    }
}

class ChatInput extends Kippy {
    constructor(parent) {
        super(parent, "div", "input");
    }

    initialise() {
        this.icon = document.createElement("i");
        this.icon.className = "fas fa-angle-right indicator";
        this.appendChild(this.icon);

        this.input = document.createElement("input");
        this.input.placeholder = "Type message..";
        this.appendChild(this.input);

        this.input.addEventListener("keypress", (event) => {
            if (event.key === "Enter") {
                this.parent.chat.add_line(`>${this.root.username}:${this.input.value}`);
                this.input.value = "";
            }
        });
    }
}