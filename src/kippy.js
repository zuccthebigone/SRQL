class Kippy {
    constructor(parent = null, name = null) {
        this.parent = parent;
        this.name = name || this.constructor.name.toLowerCase();
        this.children = [];
        if (this.parent) this.parent.children.push(this);

        this._state;
    }

    get state() {
        return this._state;
    }

    set state(new_state) {
        this._state = new_state

        Object.keys(this._state).forEach(key => {
            let n_value = this._state[key];
            Object.defineProperty(this._state, key, {
                get: () => {
                    return n_value;
                },
                set: (value) => {
                    n_value = value;
                    this.render();
                }
            });
        });

        this.render();
    }

    render_content(container) {
        return container;
    }

    render() {
        const container = document.createElement("div");
        container.className = this.name;
        this.render_content(container);
        
        this.children.forEach(child => {
            child = child.render();
            container.appendChild(child);
        });

        if (this.parent !== null) return container;

        document.body.innerHTML = "";
        document.body.appendChild(container);
    }
}

module.exports = {
    Kippy
}