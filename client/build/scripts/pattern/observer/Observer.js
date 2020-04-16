"use strict";
class Observer {
    constructor(observable) {
        this.observable = observable;
        observable.register(this);
    }
}
