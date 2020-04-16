declare abstract class Observable {
    observers: Observer<Observable>[];
    private _state;
    constructor(state: object);
    register(observer: Observer<Observable>): void;
    deregister(observer: Observer<Observable>): void;
    notify(): void;
    get state(): object;
    set state(state: object);
}
