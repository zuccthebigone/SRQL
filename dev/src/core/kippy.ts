abstract class Element {
	parent?: Kippy | HTMLDocument;
	type?: HTMLElement;
	children: Kippy[];
	_state: {
		[name: string]: any;
	};
	root?: Kippy;

	constructor(public container: HTMLElement, className: string) {
		this.container.className = className;
	}

	abstract initialise(): void;
	abstract update(): void;

	updateChildren() {
		this.update();

		this.children.forEach((child: Kippy) => {
			child.updateChildren();
		});
	}

	get state() {
		return this._state;
	}

	set state(newState: object) {
		this._state = newState;

		Object.keys(this._state).forEach((key) => {
			let newValue = this._state[key];
			Object.defineProperty(this._state, key, {
				get: () => {
					return newValue;
				},
				set: (value) => {
					newValue = value;
					this.updateChildren();
				},
			});
		});
	}
}

export class Kippy extends Element {
	constructor(
		public parent: Kippy,
		container: HTMLElement = new HTMLDivElement(),
		className: string
	) {
		super(container, className);

		this.parent.container.appendChild(this.container);
		this.parent.children.push(this);

		this.initialise();
		this.update();
	}

	initialise() {}
	update() {}
}

export class KippyRoot extends Element {
	constructor(container: HTMLElement, public className: string) {
		super(container, className);

		document.body.appendChild(this.container);

		this.initialise();
		this.update();
	}

	initialise() {}
	update() {}
}
