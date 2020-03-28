const { BrowserWindow } = require("electron").remote;

class WindowFrame extends Kippy {
    constructor() {
        super(null, "div", "window-frame");
    }
    
    initialise() {
        this.state = {
            authenticated: true
        }

        this.title_bar = new TitleBar(this);
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
        this.container.appendChild(this.settings);

        this.minimize = document.createElement("button");
        this.minimize.innerHTML = `<i class="fas fa-minus"></i>`;
        this.minimize.addEventListener("click", () => { this.window.minimize() });

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
        this.close.addEventListener("click", () => { this.window.close() });

        this.container.appendChild(this.close);
        this.container.appendChild(this.restore);
        this.container.appendChild(this.minimize);

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

        this.container.addEventListener("input", () => {
            this.state.text = this.container.value;
        });

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
        console.log(this.parent.state.text);
    }
}