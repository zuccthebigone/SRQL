"use strict";
class Observable {
    constructor(state) {
        this.observers = [];
        this._state = {};
        this.state = state;
    }
    register(observer) {
        this.observers.push(observer);
    }
    deregister(observer) {
        this.observers.filter((ob) => ob !== observer);
    }
    notify() {
        this.observers.forEach((observer) => observer.update(this._state));
    }
    get state() {
        return this._state;
    }
    set state(state) {
        this._state = state;
        this.notify();
    }
}
