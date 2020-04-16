declare abstract class Observer<T extends Observable> {
    observable: T;
    constructor(observable: T);
    abstract update(state: object): void;
}
