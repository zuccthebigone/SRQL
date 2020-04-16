abstract class Observer<T extends Observable> {
	constructor(public observable: T) {
		observable.register(this);
	}

	abstract update(state: object): void;
}
