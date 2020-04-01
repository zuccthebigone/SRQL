class Kippy {
    constructor(parent = null, type = "div", name = null) {
        this.parent = parent || document.body;
        this.type = type;
        this.name = name || this.constructor.name.toLowerCase();
        this.children = [];
        
        this._state;
        
        this.container = document.createElement(this.type);
        this.container.className = this.name;
        
        this.parent.appendChild(this.container);

        const not_root = parent !== null;
        this.root = not_root ? this.parent.root : this;
        if (not_root) this.parent.children.push(this);

        this.initialise();
        this.update();
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
                    this.update_children();
                }
            });
        });
    }

    appendChild(child) {
        this.container.appendChild(child);
    }

    initialise() {

    }

    update() {
        
    }

    update_children() {
        this.update();
        
        this.children.forEach(child => {
            child = child.update_children();
        });
    }
}

module.exports = {
    Kippy
}