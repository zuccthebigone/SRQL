abstract class Observable {
	public observers: Observer<Observable>[] = [];
	private _state: object;

	constructor(state: object) {
		this._state = {};
		this.state = state;
	}

	register(observer: Observer<Observable>) {
		this.observers.push(observer);
	}

	deregister(observer: Observer<Observable>) {
		this.observers.filter((ob) => ob !== observer);
	}

	notify() {
		this.observers.forEach((observer) => observer.update(this._state));
	}

	get state() {
		return this._state;
	}

	set state(state: object) {
		this._state = state;
		this.notify();
	}
}
