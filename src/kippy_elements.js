const { BrowserWindow } = require("electron").remote;

class WindowFrame extends Kippy {
    constructor() {
        super(null, "window-frame");

        this.state = {
            authenticated: true
        }

        this.window = BrowserWindow.getFocusedWindow();
    }

    render_content(container) {
        const title_bar = document.createElement("div");
        title_bar.className = "title-bar";

        if (this.state.authenticated) {
            const settings = document.createElement("i");
            settings.className = "fas fa-cog settings";
            title_bar.appendChild(settings);

            const srql_search = document.createElement("input");
            srql_search.className = "srql-search";
            title_bar.appendChild(srql_search);
        }

        const minimize = document.createElement("button");
        minimize.innerHTML = `<i class="fas fa-minus"></i>`;
        minimize.addEventListener("click", () => { this.window.minimize() });

        const restore = document.createElement("button");
        restore.innerHTML = `<i class="far fa-window-maximize"></i>`;
        restore.addEventListener("click", () => {
            if (this.window.isMaximized()) {
                this.window.unmaximize();
            } else {
                this.window.maximize();
            }
        });

        const close = document.createElement("button");
        close.className = "close";
        close.innerHTML = `<i class="fas fa-times"></i>`;
        close.addEventListener("click", () => { this.window.close() });

        title_bar.appendChild(close);
        title_bar.appendChild(restore);
        title_bar.appendChild(minimize);

        container.appendChild(title_bar);
    }
}